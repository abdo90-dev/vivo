import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getToken() {
  const form = new URLSearchParams({
    client_id: process.env.BOLT_CLIENT_ID!,
    client_secret: process.env.BOLT_CLIENT_SECRET!,
    grant_type: "client_credentials",
    scope: "fleet-integration:api",
  });

  const response = await fetch(
    "https://oidc.bolt.eu/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    }
  );

  return response.json();
}

export async function GET() {
  try {
    // TOKEN
    const tokenData = await getToken();

    const token = tokenData.access_token;

    if (!token) {
      return NextResponse.json({
        ok: false,
        step: "token",
        tokenData,
      });
    }

    // COMPANIES
    const companiesRes = await fetch(
      "https://node.bolt.eu/fleet-integration-gateway/fleetIntegration/v1/getCompanies",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const companiesText = await companiesRes.text();

    return NextResponse.json({
      ok: true,
      tokenPreview: token.slice(0, 20),
      companiesStatus: companiesRes.status,
      companies: companiesText,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: String(error),
    });
  }
}