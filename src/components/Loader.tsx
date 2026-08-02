import { useEffect, useState } from "react"
import Lottie from "lottie-react"
import pizzaBoxOrder from "../assets/pizza-box-order.json"

interface LoaderProps {
  size?: number
  text?: string
  fullPage?: boolean
  loop?: boolean
}

export default function Loader({ size = 220, text, fullPage = false, loop = true }: LoaderProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
  }, [])

  const loader = (
    <div className={show ? "pizza-lottie" : "opacity-0"} style={{ width: size, height: size }}>
      <Lottie animationData={pizzaBoxOrder} loop={loop} autoplay style={{ width: "100%", height: "100%" }} />
    </div>
  )

  const content = text ? (
    <div className="flex flex-col items-center gap-4">
      {loader}
      <p className="text-sm font-bold text-[var(--pc-gray-600)] animate-pulse">{text}</p>
    </div>
  ) : loader

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--pc-gray-100)]">
        {content}
      </div>
    )
  }

  return content
}
