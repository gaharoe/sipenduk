// This file exposes environment variables to the client side
export const APP_NAME = process.env.APP_NAME || "Sistem Informasi Kependudukan"

// Export the APP_NAME as a Next.js public environment variable
if (typeof window !== "undefined") {
  // @ts-ignore
  window.ENV = window.ENV || {}
  // @ts-ignore
  window.ENV.NEXT_PUBLIC_APP_NAME = APP_NAME
}

