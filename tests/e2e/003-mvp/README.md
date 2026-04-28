# MVP Journey

Verifies the full loop from Admin UI to Event to Service to Monitor.

## Test Steps

### Navigate to Home

**Description:** Load the application

**Verifications:**
- Auth Heading

![Screenshot](screenshots/Navigate to Home.png)

---

### Login and Seed Admin

**Description:** Login as test user and seed admin permissions

**Verifications:**
- User is Admin

![Screenshot](screenshots/Login and Seed Admin.png)

---

### Admin: Add Service

**Description:** Navigate to Admin and add a service

**Verifications:**
- Success Message
- Event in List

![Screenshot](screenshots/Admin: Add Service.png)

---

### Verify Service Processing

**Description:** Wait for Cloud Function to process event and create service

**Verifications:**

![Screenshot](screenshots/Verify Service Processing.png)

---

### Trigger Monitor

**Description:** Manually trigger the monitor function

**Verifications:**

![Screenshot](screenshots/Trigger Monitor.png)

---

### Verify Dashboard Status

**Description:** Check dashboard for UP status

**Verifications:**
- Service Visible
- Status OPERATIONAL

![Screenshot](screenshots/Verify Dashboard Status.png)

---

