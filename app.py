import os
import requests
import config
from database import run_local_verification

def main():
    print("==================================================================")
    print("      BAJAJ FINSERV HEALTH PROGRAMMING CHALLENGE (PYTHON)")
    print("==================================================================")
    print(f"Candidate: {config.CANDIDATE_NAME}")
    print(f"Reg No:    {config.REG_NO}")
    print(f"Email:     {config.EMAIL}")
    print("==================================================================")
    
    # 1. Run local verification first to ensure logic correctness
    run_local_verification()
    
    print("\nStep 1: Contacting API Gateway to generate webhook...")
    payload = {
        "name": config.CANDIDATE_NAME,
        "regNo": config.REG_NO,
        "email": config.EMAIL
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(config.GENERATE_WEBHOOK_URL, headers=headers, json=payload)
        if response.status_code != 200:
            print(f"[-] ERROR: Failed to generate webhook. HTTP Status: {response.status_code}")
            print(response.text)
            return
            
        response_data = response.json()
        webhook_url = response_data.get("webhook")
        access_token = response_data.get("accessToken")
        
        print("[+] SUCCESS: Webhook credentials received.")
        print(f" -> Webhook URL: {webhook_url}")
        print(f" -> Token (Truncated): {access_token[:20]}...{access_token[-20:]}")
        
        # 2. Read the SQL solution from sql_solution.sql
        print("\nStep 2: Loading SQL Query solution...")
        sql_file_path = os.path.join(os.path.dirname(__file__), "sql_solution.sql")
        
        if not os.path.exists(sql_file_path):
            print("[-] ERROR: sql_solution.sql file not found.")
            return
            
        with open(sql_file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            # Filter out comments and blank lines to get only the query
            query_lines = []
            for line in lines:
                stripped = line.strip()
                if stripped and not stripped.startswith("--"):
                    query_lines.append(line)
            sql_query = "".join(query_lines).strip()
            
        print("[+] SUCCESS: SQL Query loaded successfully.")
        print(f"Query content:\n{sql_query}\n")
        
        # 3. Submit solution to the returned webhook URL using token
        print("Step 3: Submitting SQL solution to the webhook...")
        submit_headers = {
            "Authorization": access_token,
            "Content-Type": "application/json"
        }
        submit_payload = {
            "finalQuery": sql_query
        }
        
        submit_response = requests.post(webhook_url, headers=submit_headers, json=submit_payload)
        
        print("==================================================================")
        print("                        SUBMISSION RESULTS                        ")
        print("==================================================================")
        print(f"HTTP Status Code: {submit_response.status_code}")
        print("Response Headers:")
        for k, v in submit_response.headers.items():
            print(f"  {k}: {v}")
        print("\nResponse Body:")
        print(submit_response.text)
        print("==================================================================")
        
        if submit_response.status_code == 200:
            print("\n[SUCCESS] CHALLENGE COMPLETED SUCCESSFULLY!")
        else:
            print("\n[ERROR] CHALLENGE SUBMISSION FAILED.")
            
    except Exception as e:
        print(f"[-] An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
