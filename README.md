# Bajaj Finserv Health Programming Challenge - SQL & Python Webhook Integration

This repository contains the complete, production-grade Python solution for the **Bajaj Finserv Health Programming Challenge**. The application automatically executes the entire challenge flow upon startup: local validation against standard database mock setups, secure webhook credential generation, and submitting an ANSI-compliant, database-agnostic SQL solution to the API Gateway.

---

## 👤 Candidate Profile

- **Candidate Name:** Khushi Sengar
- **Registration Number:** `0827CD231043`
- **Email:** `khushisengar230110@acropolis.in`
- **Assigned Task:** **Question 1** (Assigned because the last digit of the registration number is **Odd**: `3`)

---

## 📁 Repository Structure

```tree
.
├── config.py           # Contains candidate profile and API gateway configuration
├── database.py         # Local SQL verification module with an in-memory SQLite database
├── app.py              # Main application entry point (automates the execution flow)
├── sql_solution.sql    # Formatted production-ready SQL solution query
├── requirements.txt    # Required python dependencies (requests)
└── README.md           # Extensive technical documentation
```

---

## 📝 Problem Statement (Question 1)

Find the **highest salary** that was credited to an employee, but only for transactions that were **not made on the 1st day of any month**.

Along with the salary, extract the following employee data:
1. **SALARY**: The highest salary credited not on the 1st day of the month.
2. **NAME**: Combined `FIRST_NAME` and `LAST_NAME` into one single column as `NAME` formatted as `<first name><space><last name>`.
3. **AGE**: The age of the employee who received that salary.
4. **DEPARTMENT_NAME**: Name of the department against the employee.

### Database Schema

1. **`DEPARTMENT` Table**
   - `DEPARTMENT_ID` (INTEGER, Primary Key)
   - `DEPARTMENT_NAME` (VARCHAR)

2. **`EMPLOYEE` Table**
   - `EMP_ID` (INTEGER, Primary Key)
   - `FIRST_NAME` (VARCHAR)
   - `LAST_NAME` (VARCHAR)
   - `DOB` (DATE)
   - `GENDER` (VARCHAR)
   - `DEPARTMENT` (INTEGER, Foreign Key referencing `DEPARTMENT.DEPARTMENT_ID`)

3. **`PAYMENTS` Table**
   - `PAYMENT_ID` (INTEGER, Primary Key)
   - `EMP_ID` (INTEGER, Foreign Key referencing `EMPLOYEE.EMP_ID`)
   - `AMOUNT` (DECIMAL/REAL)
   - `PAYMENT_TIME` (TIMESTAMP/DATETIME)

---

## 💡 SQL Query Design & Strategy

### 1. Filtering Out the 1st Day of Any Month
To make the date extraction cross-compatible between different database engines (e.g., PostgreSQL, MySQL, MS SQL, Oracle), we use the standard ANSI SQL `EXTRACT` function:
```sql
WHERE EXTRACT(DAY FROM p.PAYMENT_TIME) != 1
```

### 2. Precise Age Calculation
To compute the exact age dynamically from the `DOB` while maintaining cross-database compatibility (where functions like PostgreSQL's `AGE()` or MySQL's `TIMESTAMPDIFF` are engine-specific), we implement an elegant, math-based ANSI standard expression:
```sql
(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM e.DOB) - 
 CASE 
     WHEN EXTRACT(MONTH FROM CURRENT_DATE) < EXTRACT(MONTH FROM e.DOB) 
          OR (EXTRACT(MONTH FROM CURRENT_DATE) = EXTRACT(MONTH FROM e.DOB) 
              AND EXTRACT(DAY FROM CURRENT_DATE) < EXTRACT(DAY FROM e.DOB)) 
     THEN 1 
     ELSE 0 
 END) AS AGE
```
This expression computes the year difference and decrements it by 1 if the current date hasn't reached the employee's birthday in the current calendar year.

### 3. Full Name Concatenation
The standard `CONCAT` function works on all major SQL engines:
```sql
CONCAT(e.FIRST_NAME, ' ', e.LAST_NAME) AS NAME
```

### Complete Solution SQL Query

```sql
SELECT 
    p.AMOUNT AS SALARY,
    CONCAT(e.FIRST_NAME, ' ', e.LAST_NAME) AS NAME,
    (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM e.DOB) - 
     CASE 
         WHEN EXTRACT(MONTH FROM CURRENT_DATE) < EXTRACT(MONTH FROM e.DOB) 
              OR (EXTRACT(MONTH FROM CURRENT_DATE) = EXTRACT(MONTH FROM e.DOB) 
                  AND EXTRACT(DAY FROM CURRENT_DATE) < EXTRACT(DAY FROM e.DOB)) 
         THEN 1 
         ELSE 0 
     END) AS AGE,
    d.DEPARTMENT_NAME
FROM PAYMENTS p
JOIN EMPLOYEE e ON p.EMP_ID = e.EMP_ID
JOIN DEPARTMENT d ON e.DEPARTMENT = d.DEPARTMENT_ID
WHERE EXTRACT(DAY FROM p.PAYMENT_TIME) != 1
ORDER BY p.AMOUNT DESC
LIMIT 1;
```

---

## 🔍 Step-by-Step Data Analysis

By running the local verification engine against the sample dataset provided in the challenge instructions:

1. **Filtering out payments on the 1st of the month:**
   - Excluded: Payment IDs `1`, `3`, `5`, `6`, `9`, `14`.
   - Retained: Payment IDs `2`, `4`, `7`, `8`, `10`, `11`, `12`, `13`, `15`, `16`.

2. **Finding the Maximum Remaining Amount:**
   - The highest salary transaction among the retained payments is **INR 74,998.00** (`PAYMENT_ID 16` on `2025-03-02`).

3. **Retrieving Employee Details:**
   - Employee ID `4` received this transaction.
   - Name: `Emily` + ` ` + `Brown` = **Emily Brown**
   - Date of Birth: `1992-11-30`
   - Department: ID `4` = **Sales**

4. **Calculating Age:**
   - Based on Current System Time (May 18, 2026), Emily's age is calculated precisely as **33** years (since her birthday is on November 30).

---

## ⚙️ Running Locally & Webhook Submission

### 1. Install Dependencies
Ensure you have Python 3.7+ installed. Install the standard REST client dependencies:
```bash
pip install -r requirements.txt
```

### 2. Execute the Pipeline
Run the main script:
```bash
python app.py
```

### 3. Execution Logs Sample Output
```text
==================================================================
      BAJAJ FINSERV HEALTH PROGRAMMING CHALLENGE (PYTHON)
==================================================================
Candidate: Khushi Sengar
Reg No:    0827CD231043
Email:     khushisengar230110@acropolis.in
==================================================================

--- Initiating Local Verification ---
Local Verification SUCCESSFUL!
 -> Highest Qualified Salary: INR 74998.00
 -> Credited Employee: Emily Brown
 -> Age: 33 years
 -> Department: Sales

Step 1: Contacting API Gateway to generate webhook...
[+] SUCCESS: Webhook credentials received.
 -> Webhook URL: https://bfhldevapigw.healthrx.co.in/hiring/testWebhook/PYTHON
 -> Token (Truncated): eyJhbGciOiJIUzI1NiJ9...myBWGcwkfy26vKhKYD7s

Step 2: Loading SQL Query solution...
[+] SUCCESS: SQL Query loaded successfully.
Query content:
SELECT 
    p.AMOUNT AS SALARY,
    CONCAT(e.FIRST_NAME, ' ', e.LAST_NAME) AS NAME,
    (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM e.DOB) - 
     CASE 
         WHEN EXTRACT(MONTH FROM CURRENT_DATE) < EXTRACT(MONTH FROM e.DOB) 
              OR (EXTRACT(MONTH FROM CURRENT_DATE) = EXTRACT(MONTH FROM e.DOB) 
                  AND EXTRACT(DAY FROM CURRENT_DATE) < EXTRACT(DAY FROM e.DOB)) 
         THEN 1 
         ELSE 0 
     END) AS AGE,
    d.DEPARTMENT_NAME
FROM PAYMENTS p
JOIN EMPLOYEE e ON p.EMP_ID = e.EMP_ID
JOIN DEPARTMENT d ON e.DEPARTMENT = d.DEPARTMENT_ID
WHERE EXTRACT(DAY FROM p.PAYMENT_TIME) != 1
ORDER BY p.AMOUNT DESC
LIMIT 1;

Step 3: Submitting SQL solution to the webhook...
==================================================================
                        SUBMISSION RESULTS                        
==================================================================
HTTP Status Code: 200
Response Headers:
  Cache-Control: no-cache, no-store, max-age=0, must-revalidate
  Pragma: no-cache
  Transfer-Encoding: chunked
  Content-Type: application/json
  Expires: 0
  Strict-Transport-Security: max-age=31536000 ; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-Xss-Protection: 0
  Date: Sun, 17 May 2026 18:38:59 GMT

Response Body:
{"success":true,"message":"Webhook processed successfully"}
==================================================================

[SUCCESS] CHALLENGE COMPLETED SUCCESSFULLY!
```
