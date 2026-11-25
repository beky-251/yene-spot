-- =========================================================
-- YENESPOT STORAGE BUCKETS AND ACCESS POLICIES
-- =========================================================

-- Create public image buckets with upload restrictions.
INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES
    ('business-images', 'business-images', TRUE, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('business-logos', 'business-logos', TRUE, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('business-covers', 'business-covers', TRUE, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('user-avatars', 'user-avatars', TRUE, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Check whether a user owns a business or is an administrator.
CREATE OR REPLACE FUNCTION public.can_manage_business_media(
    p_business_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.businesses AS b
        WHERE b.id = p_business_id
          AND (
              b.owner_id = (SELECT auth.uid())
              OR public.is_admin()
          )
    );
$$;

REVOKE ALL ON FUNCTION public.can_manage_business_media(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_business_media(UUID)
TO authenticated;

-- Public can view images in the four public buckets.
CREATE POLICY "Public can view YeneSpot media"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
    bucket_id IN (
        'business-images',
        'business-logos',
        'business-covers',
        'user-avatars'
    )
);

-- Business owners and administrators can upload business media.
CREATE POLICY "Business owners can upload business media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id IN ('business-images', 'business-logos', 'business-covers')
    AND CASE
        WHEN (storage.foldername(name))[1] ~*
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN public.can_manage_business_media(
            ((storage.foldername(name))[1])::UUID
        )
        ELSE FALSE
    END
);

-- Business owners and administrators can update business media.
CREATE POLICY "Business owners can update business media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id IN ('business-images', 'business-logos', 'business-covers')
    AND CASE
        WHEN (storage.foldername(name))[1] ~*
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN public.can_manage_business_media(
            ((storage.foldername(name))[1])::UUID
        )
        ELSE FALSE
    END
)
WITH CHECK (
    bucket_id IN ('business-images', 'business-logos', 'business-covers')
    AND CASE
        WHEN (storage.foldername(name))[1] ~*
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN public.can_manage_business_media(
            ((storage.foldername(name))[1])::UUID
        )
        ELSE FALSE
    END
);

-- Business owners and administrators can delete business media.
CREATE POLICY "Business owners can delete business media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id IN ('business-images', 'business-logos', 'business-covers')
    AND CASE
        WHEN (storage.foldername(name))[1] ~*
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN public.can_manage_business_media(
            ((storage.foldername(name))[1])::UUID
        )
        ELSE FALSE
    END
);

-- Users can upload, update, and delete only their own avatars.
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
);

CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
)
WITH CHECK (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
);