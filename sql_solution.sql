-- Bajaj Finserv Health Programming Challenge
-- Question 1: SQL Problem Solution
-- Assigned to: Khushi Sengar (Reg No: 0827CD231043 - Odd last digit)
--
-- Problem Statement:
-- Find the highest salary that was credited to an employee, but only for transactions 
-- that were not made on the 1st day of any month. Along with the salary, you are also 
-- required to extract the employee data like name (combine first name and last name 
-- into one column), age and department who received this salary.
--
-- Output Columns Required:
-- 1. SALARY: The highest salary credited not on the 1st of the month.
-- 2. NAME: Combined FIRST_NAME and LAST_NAME with a space between.
-- 3. AGE: The current age of the employee calculated from DOB.
-- 4. DEPARTMENT_NAME: The name of the employee's department.

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
