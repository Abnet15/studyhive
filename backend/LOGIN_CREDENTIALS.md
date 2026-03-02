# StudyHive Login Credentials

## Default Users (from schema.sql)

After running the database schema, these users are available:

### Admin Account
- **Email:** `admin@studyhive.com`
- **Password:** `password`
- **Role:** Admin
- **Access:** Full admin dashboard, can approve/reject materials, manage users

### Test Student Accounts

#### Alem
- **Email:** `alem@example.com`
- **Password:** `password`
- **Department:** Computer Science
- **Year:** 3
- **Role:** Student

#### Sara
- **Email:** `sara@example.com`
- **Password:** `password`
- **Department:** Electrical Engineering
- **Year:** 2
- **Role:** Student

## Creating New Users

New users can register through the frontend registration page. They will be created as students by default.

## Resetting Passwords

To reset a password, you can update the `password_hash` in the database using bcrypt:

```sql
-- Example: Reset admin password to "newpassword"
-- First generate hash using Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('newpassword', 10);
-- Then update:
-- UPDATE users SET password_hash = '<generated_hash>' WHERE email = 'admin@studyhive.com';
```

## Notes

- All default passwords are: `password`
- Passwords are hashed using bcrypt with 10 rounds
- Users must be active (`is_active = 1`) to login
- Admin users have full access to all features

