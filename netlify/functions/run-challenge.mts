import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Candidate info
  const name = "Khushi Sengar";
  const regNo = "0827CD231043";
  const email = "khushisengar230110@acropolis.in";

  const generateWebhookUrl = "https://bfhldevapigw.healthrx.co.in/hiring/generateWebhook/PYTHON";

  // Production ANSI-compliant SQL Query for Question 1 (odd registration number: last digit is 3)
  const sqlQuery = `SELECT 
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
LIMIT 1;`.trim();

  try {
    // Step 1: Generate webhook
    console.log("Generating webhook on Live API Gateway...");
    const genResponse = await fetch(generateWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, regNo, email }),
    });

    if (!genResponse.ok) {
      const errorText = await genResponse.text();
      return new Response(
        JSON.stringify({
          success: false,
          stage: "generate_webhook",
          status: genResponse.status,
          error: errorText,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const genData = await genResponse.json();
    const webhookUrl = genData.webhook;
    const accessToken = genData.accessToken;

    if (!webhookUrl || !accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          stage: "parse_credentials",
          error: "Webhook URL or Access Token was missing in gateway response.",
          response: genData,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Submit SQL solution to the returned webhook URL using the token
    console.log(`Submitting SQL solution to: ${webhookUrl}`);
    const submitResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Authorization": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        finalQuery: sqlQuery,
      }),
    });

    const submitText = await submitResponse.text();
    let submitData;
    try {
      submitData = JSON.parse(submitText);
    } catch {
      submitData = { raw: submitText };
    }

    return new Response(
      JSON.stringify({
        success: submitResponse.ok && submitData.success !== false,
        stage: "submit_solution",
        status: submitResponse.status,
        webhookUrl,
        accessTokenSummary: `${accessToken.substring(0, 15)}...${accessToken.substring(accessToken.length - 15)}`,
        sqlQuery,
        gatewayResponse: submitData,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        stage: "internal_error",
        error: error.message || String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config: Config = {
  path: "/api/run-challenge"
};
