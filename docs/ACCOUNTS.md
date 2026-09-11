# WorkNest — Demo Accounts & Login Credentials

This document lists all pre-seeded user accounts in the PostgreSQL database for testing, demonstrations, and college evaluations.

---

## 🔑 Pre-Seeded Accounts Directory

| Role | Name | Email | Password | Company / Tenant | Default Dashboard |
|---|---|---|---|---|---|
| **`SUPER_ADMIN`** | Super Admin | `admin@worknest.local` | `admin123` | *Platform Level* | `/admin` |
| **`COMPANY_OWNER`** | Jaimin Dodiya | `owner@worknest.local` | `owner123` | WorkNest Technologies | `/dashboard` |
| **`HR`** | Priya Shah | `hr@worknest.local` | `hr123` | WorkNest Technologies | `/hr` |
| **`MANAGER`** | Rahul Kumar | `manager@worknest.local` | `manager123` | WorkNest Technologies | `/manager` |
| **`MANAGER`** | Anita Mehta | `anita@worknest.local` | `anita123` | WorkNest Technologies | `/manager` |
| **`EMPLOYEE`** | Vikram Patel | `employee@worknest.local` | `employee123` | WorkNest Technologies | `/employee` |
| **`EMPLOYEE`** | Sneha Reddy | `sneha@worknest.local` | `sneha123` | WorkNest Technologies | `/employee` |
| **`EMPLOYEE`** | Amit Sharma | `amit@worknest.local` | `amit123` | WorkNest Technologies | `/employee` |
| **`EMPLOYEE`** | Deepa Nair | `deepa@worknest.local` | `deepa123` | WorkNest Technologies | `/employee` |
| **`EMPLOYEE` (Inactive)** | Karan Joshi | `karan@worknest.local` | `karan123` | WorkNest Technologies | *Blocked (401)* |
| **`COMPANY_OWNER` (Tenant 2)** | Ravi Desai | `ravi@technova.local` | `ravi123` | TechNova Solutions | `/dashboard` |
| **`EMPLOYEE` (Tenant 2)** | Meera Kapoor | `meera@technova.local` | `meera123` | TechNova Solutions | `/employee` |

---

## 🆕 How Passwords Work for Newly Created Employees

When HR (or an Owner/Admin) creates a new employee from the **"Add User"** modal:

1. **Custom Password**: HR can type a specific password for the employee.
2. **Default Password**: If HR leaves the password blank, WorkNest automatically assigns:
   👉 **`worknest123`**

### How to Log in as a Newly Created Employee:
1. HR creates the employee (e.g. Email: `dipak@worknest.local`, Password: `worknest123` or custom).
2. Logout from HR account.
3. On the **Login Screen**:
   - Enter Email: `dipak@worknest.local`
   - Enter Password: `worknest123`
4. Click **Sign In**.
5. The application will authenticate against PostgreSQL and immediately open that employee's **Employee Dashboard** and **My Tasks** workspace!
