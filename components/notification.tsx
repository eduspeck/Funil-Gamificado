"use client"

import { motion } from "framer-motion"
import { X, TrendingUp, Gift, Users } from "lucide-react"

interface NotificationProps {
  id: string
  type: "social" | "personal" | "bonus" | "activity"
  message: string
  onClose: () => void
  position?: "top" | "bottom"
}

export function Notification({ id, type, message, onClose, position = "top" }: NotificationProps) {
  const getIcon = () => {
    switch (type) {
      case "social":
        return <TrendingUp className="w-4 h-4 text-[#C6FF00]" />
      case "personal":
        return (
          <div className="w-4 h-4 rounded-full bg-[#C6FF00] flex items-center justify-center text-black text-xs font-bold">
            +
          </div>
        )
      case "bonus":
        return <Gift className="w-4 h-4 text-[#00FFB2]" />
      case "activity":
        return <Users className="w-4 h-4 text-[#00FFB2]" />
      default:
        return <TrendingUp className="w-4 h-4 text-[#C6FF00]" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "personal":
        return "bg-gradient-to-r from-[#C6FF00]/20 to-[#00FFB2]/20 border-[#C6FF00]/50"
      case "bonus":
        return "bg-gradient-to-r from-[#00FFB2]/20 to-[#C6FF00]/20 border-[#00FFB2]/50"
      default:
        return "bg-gray-900/95 border-gray-700"
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: position === "top" ? -100 : 100,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: position === "top" ? -100 : 100,
        scale: 0.8,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`
        fixed ${position === "top" ? "top-4" : "bottom-4"} left-4 right-4 md:left-auto md:right-4 md:w-80
        ${getBgColor()}
        backdrop-blur-md border rounded-xl p-4 shadow-2xl z-50
        flex items-center gap-3
      `}
    >
      <div className="flex-shrink-0">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{message}</p>
      </div>

      <button onClick={onClose} className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors">
        <X className="w-3 h-3 text-gray-400" />
      </button>
    </motion.div>
  )
}
