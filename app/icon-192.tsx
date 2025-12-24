import { ImageResponse } from "next/og"

export const size = {
  width: 192,
  height: 192,
}

export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 96,
        background: "#3b82f6",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: "50%",
        fontWeight: "bold",
      }}
    >
      S
    </div>,
    {
      ...size,
    },
  )
}

