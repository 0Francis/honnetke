# HonnetKE Database Schema

```sql
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE landlords (
    landlord_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agents (
    agent_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE listings (
    listing_id SERIAL PRIMARY KEY,
    landlord_id INT REFERENCES landlords(landlord_id) ON DELETE CASCADE,
    agent_id INT REFERENCES agents(agent_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    property_type VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    gender_preference VARCHAR(10) CHECK (gender_preference IN ('male', 'female', 'mixed')),
    room_type VARCHAR(20) CHECK (room_type IN ('single', 'ensuite', 'shared')),
    amenities TEXT[],
    county VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    nearest_campus VARCHAR(150),
    address VARCHAR(255),
    status VARCHAR(10) CHECK (status IN ('pending', 'active', 'inactive', 'blocked')) DEFAULT 'pending',
    approved_by INT REFERENCES admins(admin_id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    decline_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (
        (landlord_id IS NOT NULL AND agent_id IS NULL)
        OR
        (landlord_id IS NULL AND agent_id IS NOT NULL)
    )
);

CREATE TABLE listing_images (
    image_id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(listing_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE favourites (
    favourite_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    listing_id INT REFERENCES listings(listing_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, listing_id)
);

CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    listing_id INT REFERENCES listings(listing_id) ON DELETE CASCADE,
    status VARCHAR(15) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'declined')) DEFAULT 'pending',
    request_note TEXT,
    provider_response TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, listing_id)
);

CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    listing_id INT REFERENCES listings(listing_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(10) CHECK (status IN ('pending', 'resolved')) DEFAULT 'pending',
    resolution_note TEXT,
    resolved_at TIMESTAMP,
    resolved_by INT REFERENCES admins(admin_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE warnings (
    warning_id SERIAL PRIMARY KEY,
    issued_by INT REFERENCES admins(admin_id) ON DELETE SET NULL,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    landlord_id INT REFERENCES landlords(landlord_id) ON DELETE CASCADE,
    agent_id INT REFERENCES agents(agent_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (
        (student_id IS NOT NULL AND landlord_id IS NULL AND agent_id IS NULL)
        OR
        (student_id IS NULL AND landlord_id IS NOT NULL AND agent_id IS NULL)
        OR
        (student_id IS NULL AND landlord_id IS NULL AND agent_id IS NOT NULL)
    )
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    landlord_id INT REFERENCES landlords(landlord_id) ON DELETE CASCADE,
    agent_id INT REFERENCES agents(agent_id) ON DELETE CASCADE,
    admin_id INT REFERENCES admins(admin_id) ON DELETE CASCADE,
    booking_id INT REFERENCES bookings(booking_id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('listing_review', 'booking_update', 'system')) DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (
        (student_id IS NOT NULL)::int
        + (landlord_id IS NOT NULL)::int
        + (agent_id IS NOT NULL)::int
        + (admin_id IS NOT NULL)::int = 1
    )
);

CREATE TABLE analytics (
    analytics_id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(listing_id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    view_count INT DEFAULT 0,
    UNIQUE(listing_id, week_start)
);

CREATE TABLE error_logs (
    log_id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    stack_trace TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE traffic_logs (
    traffic_id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    visit_count INT DEFAULT 0,
    UNIQUE(date)
);
```

## Role Table Notes

- There is no shared account table in this ERD/database version.
- `students`, `landlords`, `agents`, and `admins` each store their own account/profile fields.
- Student actions are stored through `favourites`, `bookings`, and `reports`.
- A listing belongs to either a landlord or an agent.
- Admin approval and moderation records reference `admins.admin_id`.
