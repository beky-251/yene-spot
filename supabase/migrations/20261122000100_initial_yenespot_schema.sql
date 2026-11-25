-- =========================================================
-- YENESPOT INITIAL DATABASE SCHEMA
-- PostgreSQL / Supabase
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. PROFILES
-- =========================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'business_owner', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 2. CATEGORIES
-- =========================================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 3. BUSINESSES
-- =========================================================

CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    address TEXT,
    city TEXT NOT NULL DEFAULT 'Jimma',
    neighborhood TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    opening_hours JSONB NOT NULL DEFAULT '{}'::JSONB,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT businesses_latitude_range
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),

    CONSTRAINT businesses_longitude_range
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),

    CONSTRAINT businesses_coordinates_complete
        CHECK (
            (latitude IS NULL AND longitude IS NULL)
            OR
            (latitude IS NOT NULL AND longitude IS NOT NULL)
        )
);

-- =========================================================
-- 4. BUSINESS IMAGES
-- =========================================================

CREATE TABLE public.business_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 5. FAVORITES
-- =========================================================

CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT favorites_user_business_unique
        UNIQUE (user_id, business_id)
);

-- =========================================================
-- 6. CONTACT MESSAGES
-- =========================================================

CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread'
        CHECK (status IN ('unread', 'read', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 7. BUSINESS REVIEWS
-- =========================================================

CREATE TABLE public.business_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT business_reviews_user_business_unique
        UNIQUE (user_id, business_id)
);

-- =========================================================
-- 8. BUSINESS CLAIMS
-- =========================================================

CREATE TABLE public.business_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT business_claims_business_user_unique
        UNIQUE (business_id, user_id)
);

-- =========================================================
-- =========================================================
-- AUTOMATIC PROFILE CREATION
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
            NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
            'YeneSpot User'
        ),
        NEW.email,
        'customer'
    );

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- PROFILE ROLE PROTECTION
-- =========================================================

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role
       AND (SELECT auth.uid()) IS NOT NULL
       AND NOT public.is_admin()
    THEN
        RAISE EXCEPTION 'Only administrators can change profile roles.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();

-- =========================================================
-- BUSINESS APPROVAL PROTECTION
-- =========================================================

CREATE OR REPLACE FUNCTION public.protect_business_approval_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF OLD.owner_id = (SELECT auth.uid())
       AND NOT public.is_admin()
       AND (
           NEW.owner_id IS DISTINCT FROM OLD.owner_id
           OR NEW.status IS DISTINCT FROM OLD.status
           OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
       )
    THEN
        RAISE EXCEPTION
            'Business owners cannot change ownership, approval status, or featured status.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER protect_business_approval_fields
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.protect_business_approval_fields();

-- =========================================================
-- REVIEW MODERATION PROTECTION
-- =========================================================

CREATE OR REPLACE FUNCTION public.protect_review_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF OLD.user_id = (SELECT auth.uid())
       AND NOT public.is_admin()
       AND (
           NEW.user_id IS DISTINCT FROM OLD.user_id
           OR NEW.business_id IS DISTINCT FROM OLD.business_id
           OR NEW.status IS DISTINCT FROM OLD.status
       )
    THEN
        RAISE EXCEPTION
            'Customers cannot change review ownership, business, or moderation status.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER protect_review_moderation
BEFORE UPDATE ON public.business_reviews
FOR EACH ROW
EXECUTE FUNCTION public.protect_review_moderation();
-- INDEXES
-- =========================================================

CREATE INDEX businesses_owner_id_idx
    ON public.businesses(owner_id);

CREATE INDEX businesses_category_id_idx
    ON public.businesses(category_id);

CREATE INDEX businesses_status_idx
    ON public.businesses(status);

CREATE INDEX businesses_city_idx
    ON public.businesses(city);

CREATE INDEX businesses_featured_idx
    ON public.businesses(is_featured)
    WHERE is_featured = TRUE;

CREATE INDEX business_images_business_id_idx
    ON public.business_images(business_id);

CREATE INDEX favorites_user_id_idx
    ON public.favorites(user_id);

CREATE INDEX favorites_business_id_idx
    ON public.favorites(business_id);

CREATE INDEX business_reviews_business_id_idx
    ON public.business_reviews(business_id);

CREATE INDEX business_claims_user_id_idx
    ON public.business_claims(user_id);

CREATE INDEX business_claims_business_id_idx
    ON public.business_claims(business_id);

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER business_reviews_updated_at
BEFORE UPDATE ON public.business_reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SECURITY HELPER
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- =========================================================
-- PROFILES POLICIES
-- =========================================================

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()) OR public.is_admin())
WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());

-- =========================================================
-- CATEGORY POLICIES
-- =========================================================

CREATE POLICY "Public can view active categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =========================================================
-- BUSINESS POLICIES
-- =========================================================

CREATE POLICY "Public can view approved businesses"
ON public.businesses
FOR SELECT
TO anon, authenticated
USING (status = 'approved' OR owner_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Approved business owners can create businesses"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND status = 'pending'
    AND is_featured = FALSE
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'business_owner'
    )
);

CREATE POLICY "Owners and admins can update businesses"
ON public.businesses
FOR UPDATE
TO authenticated
USING (owner_id = (SELECT auth.uid()) OR public.is_admin())
WITH CHECK (owner_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Admins can delete businesses"
ON public.businesses
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =========================================================
-- BUSINESS IMAGE POLICIES
-- =========================================================

CREATE POLICY "Public can view images of approved businesses"
ON public.business_images
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.businesses
        WHERE businesses.id = business_images.business_id
          AND (
              businesses.status = 'approved'
              OR businesses.owner_id = (SELECT auth.uid())
              OR public.is_admin()
          )
    )
);

CREATE POLICY "Owners can manage their business images"
ON public.business_images
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.businesses
        WHERE businesses.id = business_images.business_id
          AND businesses.owner_id = (SELECT auth.uid())
    )
    OR public.is_admin()
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.businesses
        WHERE businesses.id = business_images.business_id
          AND businesses.owner_id = (SELECT auth.uid())
    )
    OR public.is_admin()
);

-- =========================================================
-- FAVORITE POLICIES
-- =========================================================

CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Users can add their own favorites"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can remove their own favorites"
ON public.favorites
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- =========================================================
-- CONTACT MESSAGE POLICIES
-- =========================================================

CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (TRUE);

CREATE POLICY "Admins can manage contact messages"
ON public.contact_messages
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =========================================================
-- REVIEW POLICIES
-- =========================================================

CREATE POLICY "Public can view approved reviews"
ON public.business_reviews
FOR SELECT
TO anon, authenticated
USING (
    status = 'approved'
    OR user_id = (SELECT auth.uid())
    OR public.is_admin()
);

CREATE POLICY "Customers can review approved businesses"
ON public.business_reviews
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'pending'
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'customer'
    )
    AND EXISTS (
        SELECT 1
        FROM public.businesses
        WHERE id = business_reviews.business_id
          AND status = 'approved'
          AND owner_id <> (SELECT auth.uid())
    )
);

CREATE POLICY "Users can update their pending reviews"
ON public.business_reviews
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin())
WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Users can delete their own reviews"
ON public.business_reviews
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- =========================================================
-- BUSINESS CLAIM POLICIES
-- =========================================================

CREATE POLICY "Users can view their own claims"
ON public.business_claims
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Users can submit valid claims"
ON public.business_claims
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
    AND verification_status = 'pending'
    AND EXISTS (
        SELECT 1
        FROM public.businesses
        WHERE id = business_claims.business_id
          AND status = 'approved'
          AND owner_id <> (SELECT auth.uid())
    )
);

CREATE POLICY "Admins can manage claims"
ON public.business_claims
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =========================================================
-- =========================================================
-- TABLE PRIVILEGES — LEAST PRIVILEGE
-- =========================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

REVOKE ALL ON TABLE
    public.profiles,
    public.categories,
    public.businesses,
    public.business_images,
    public.favorites,
    public.contact_messages,
    public.business_reviews,
    public.business_claims
FROM anon, authenticated;

-- Public browsing
GRANT SELECT ON
    public.categories,
    public.businesses,
    public.business_images,
    public.business_reviews
TO anon, authenticated;

-- Public contact form
GRANT INSERT (name, email, subject, message)
ON public.contact_messages TO anon, authenticated;

-- Profiles
GRANT SELECT ON public.profiles TO authenticated;

GRANT UPDATE (full_name, avatar_url)
ON public.profiles TO authenticated;

-- Categories
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.categories TO authenticated;

-- Businesses
GRANT SELECT, INSERT, DELETE
ON public.businesses TO authenticated;

GRANT UPDATE (
    category_id,
    name,
    slug,
    description,
    phone,
    whatsapp,
    email,
    website,
    logo_url,
    cover_image_url,
    address,
    city,
    neighborhood,
    latitude,
    longitude,
    opening_hours
)
ON public.businesses TO authenticated;

-- Business images
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.business_images TO authenticated;

-- Favorites
GRANT SELECT, INSERT, DELETE
ON public.favorites TO authenticated;

-- Contact messages
GRANT SELECT, UPDATE, DELETE
ON public.contact_messages TO authenticated;

-- Reviews
GRANT SELECT, INSERT, DELETE
ON public.business_reviews TO authenticated;

GRANT UPDATE (rating, comment, status)
ON public.business_reviews TO authenticated;

-- Claims
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.business_claims TO authenticated;


-- =========================================================
-- ADMINISTRATOR BUSINESS OWNER APPROVAL
-- =========================================================

CREATE OR REPLACE FUNCTION public.approve_business_owner(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    IF (SELECT auth.uid()) IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only administrators can approve business owners.'
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.profiles
    SET role = 'business_owner'
    WHERE id = p_user_id
      AND role = 'customer';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows <> 1 THEN
        RAISE EXCEPTION 'Customer profile not found or already has another role.';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_business_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_business_owner(UUID) TO authenticated;
