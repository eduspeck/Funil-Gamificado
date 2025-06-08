"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Gift, Sparkles, TrendingUp, Check, Star } from "lucide-react"
import { Notification } from "./components/notification"

interface Question {
  id: number
  text: string
  options: string[]
}

interface NotificationData {
  id: string
  type: "social" | "personal" | "bonus" | "activity"
  message: string
  position?: "top" | "bottom"
}

const questions: Question[] = [
  {
    id: 1,
    text: "Qual o principal motivo que te faz buscar uma renda extra?",
    options: ["Pagar contas", "Realizar sonhos", "Ter mais liberdade", "Emergências"],
  },
  {
    id: 2,
    text: "Você toparia ganhar dinheiro apenas divulgando um link, sem precisar aparecer?",
    options: ["Sim, perfeito!", "Talvez", "Preciso saber mais", "Não sei"],
  },
  {
    id: 3,
    text: "Quanto você gostaria de ganhar por mês com isso?",
    options: ["R$ 500-1000", "R$ 1000-3000", "R$ 3000-5000", "Mais de R$ 5000"],
  },
  {
    id: 4,
    text: "Você já tentou ganhar dinheiro online antes? Como foi?",
    options: ["Nunca tentei", "Tentei mas não deu certo", "Tive algum sucesso", "Já ganho online"],
  },
  {
    id: 5,
    text: "Qual seria a primeira coisa que você faria se entrasse R$500 na sua conta hoje?",
    options: ["Pagaria contas", "Compraria algo especial", "Investiria", "Guardaria"],
  },
  {
    id: 6,
    text: "Você se considera alguém que aprende rápido e gosta de testar novidades?",
    options: ["Sim, totalmente!", "Mais ou menos", "Depende do assunto", "Prefiro o tradicional"],
  },
  {
    id: 7,
    text: "Você usaria apenas o celular ou também um computador para trabalhar com isso?",
    options: ["Só celular", "Celular e computador", "Prefiro computador", "Tanto faz"],
  },
  {
    id: 8,
    text: "Quanto tempo por dia você estaria disposta a dedicar para ganhar dinheiro com isso?",
    options: ["30min-1h", "1h-2h", "2h-4h", "Mais de 4h"],
  },
  {
    id: 9,
    text: "Se eu te mostrar um método que já colocou dinheiro no bolso de mais de 5 mil pessoas, você daria uma chance?",
    options: ["Com certeza!", "Provavelmente sim", "Preciso ver primeiro", "Talvez"],
  },
  {
    id: 10,
    text: "Pronto! Seu painel está quase liberado. Confirme que deseja ver o guia completo e o bônus exclusivo.",
    options: ["Sim, quero ver!", "Confirmo!", "Liberar agora!", "Vamos lá!"],
  },
]

const socialProofMessages = [
  "Camila M. acabou de ganhar R$70,00",
  "Lucas desbloqueou o bônus exclusivo",
  "Ana Clara ganhou R$120,00 hoje",
  "Pedro liberou o painel premium",
  "Mariana está com R$85,00 acumulados",
  "João desbloqueou todos os bônus",
  "Fernanda ganhou R$95,00 em 2 horas",
  "Ricardo liberou o guia completo",
  "Juliana acumulou R$150,00 hoje",
  "Carlos desbloqueou o método exclusivo",
]

const activityMessages = [
  "Mais de 500 pessoas ativas agora no painel",
  "347 usuários online neste momento",
  "Mais de 1.200 pessoas ganharam hoje",
  "892 bônus foram liberados hoje",
  "Painel com alta atividade - 678 usuários",
  "Mais de 2.000 pessoas já desbloquearam",
]

const MAX_VISIBLE_MESSAGES = 3 // Máximo de mensagens visíveis
const PRODUCT_PRICE = 297.8 // Preço original do produto

// Lista de possíveis caminhos para o arquivo de áudio
const AUDIO_PATHS = [
  "/som-de-notificacao-da-kwify.mp3",
  "/sounds/som-de-notificacao-da-kwify.mp3",
  "som-de-notificacao-da-kwify.mp3",
  "https://raw.githubusercontent.com/eduspeck/Funil-Gamificado/main/som-de-notificacao-da-kwify.mp3",
]

// Valores da roleta
const ROULETTE_VALUES = [5, 20, 50, 150, 75, 20, 5, 150, 75, 50, 20, 5]

export default function Component() {
  const [currentStep, setCurrentStep] = useState(0)
  const [balance, setBalance] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [showBonus, setShowBonus] = useState(false)
  const [showFinalOffer, setShowFinalOffer] = useState(false)
  const [showProductReview, setShowProductReview] = useState(false)
  const [showRoulette, setShowRoulette] = useState(false)
  const [rouletteSpinning, setRouletteSpinning] = useState(false)
  const [rouletteResult, setRouletteResult] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [messages, setMessages] = useState<Array<{ type: "bot" | "user"; text: string; id: number }>>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const socialProofIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const cashSoundRef = useRef<HTMLAudioElement | null>(null)
  const audioInitializedRef = useRef<boolean>(false)
  const [workingAudioPath, setWorkingAudioPath] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Função para testar os caminhos de áudio e encontrar um que funcione
  const testAudioPaths = useCallback(async () => {
    if (typeof window === "undefined") return

    // Criar um elemento de áudio para teste
    const testAudio = new Audio()

    // Função para testar um caminho específico
    const testPath = (path: string): Promise<boolean> => {
      return new Promise((resolve) => {
        testAudio.src = path

        const successHandler = () => {
          console.log(`✅ Caminho de áudio funcionando: ${path}`)
          resolve(true)
          testAudio.removeEventListener("canplaythrough", successHandler)
          testAudio.removeEventListener("error", errorHandler)
        }

        const errorHandler = () => {
          console.log(`❌ Caminho de áudio falhou: ${path}`)
          resolve(false)
          testAudio.removeEventListener("canplaythrough", successHandler)
          testAudio.removeEventListener("error", errorHandler)
        }

        testAudio.addEventListener("canplaythrough", successHandler)
        testAudio.addEventListener("error", errorHandler)

        // Definir um timeout para caso o evento nunca dispare
        setTimeout(() => {
          errorHandler()
        }, 2000)

        // Tentar carregar o áudio
        testAudio.load()
      })
    }

    // Testar cada caminho até encontrar um que funcione
    for (const path of AUDIO_PATHS) {
      const success = await testPath(path)
      if (success) {
        setWorkingAudioPath(path)
        return path
      }
    }

    // Se nenhum caminho funcionar, usar o fallback
    console.log("⚠️ Nenhum caminho de áudio funcionou, usando fallback")
    return null
  }, [])

  // Initialize audio
  useEffect(() => {
    if (typeof window !== "undefined" && !audioInitializedRef.current) {
      // Testar os caminhos de áudio
      testAudioPaths().then((workingPath) => {
        if (workingPath) {
          // Create audio element for cash sound
          cashSoundRef.current = new Audio(workingPath)
          cashSoundRef.current.preload = "auto"
          cashSoundRef.current.volume = 0.7 // Ajuste o volume se necessário

          console.log(`🎵 Áudio inicializado com caminho: ${workingPath}`)
        }
      })

      // For Web Audio API fallback
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.error("Erro ao criar contexto de áudio:", error)
      }

      // Initialize audio on first user interaction - versão menos intrusiva
      const initAudio = () => {
        if (!audioInitializedRef.current) {
          // Se temos um elemento de áudio, tente inicializá-lo
          if (cashSoundRef.current) {
            // Play and immediately pause to enable audio on iOS
            const playPromise = cashSoundRef.current.play()

            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  cashSoundRef.current!.pause()
                  cashSoundRef.current!.currentTime = 0
                  audioInitializedRef.current = true
                  console.log("✅ Áudio inicializado com sucesso!")
                })
                .catch((error) => {
                  console.log("⚠️ Erro ao inicializar áudio:", error)
                  // Não marcar como inicializado para permitir novas tentativas
                })
            }
          } else {
            // Se não temos um elemento de áudio, marcar como inicializado para usar o fallback
            audioInitializedRef.current = true
          }
        }
      }

      document.addEventListener("click", initAudio)
      document.addEventListener("touchstart", initAudio)

      return () => {
        document.removeEventListener("click", initAudio)
        document.removeEventListener("touchstart", initAudio)
      }
    }
  }, [testAudioPaths])

  // Start social proof notifications
  useEffect(() => {
    const startSocialProof = () => {
      socialProofIntervalRef.current = setInterval(
        () => {
          const isActivity = Math.random() > 0.7
          const messages = isActivity ? activityMessages : socialProofMessages
          const randomMessage = messages[Math.floor(Math.random() * messages.length)]

          showNotification({
            type: isActivity ? "activity" : "social",
            message: randomMessage,
            position: "top",
          })
        },
        8000 + Math.random() * 7000,
      ) // 8-15 seconds interval
    }

    // Start after 3 seconds
    const timeout = setTimeout(startSocialProof, 3000)

    return () => {
      clearTimeout(timeout)
      if (socialProofIntervalRef.current) {
        clearInterval(socialProofIntervalRef.current)
      }
    }
  }, [])

  // Play cash sound - versão robusta com múltiplas tentativas
  const playCashSound = () => {
    console.log("💰 Tentando tocar som de cash...")

    // Try to play the audio file if we have a working path
    if (cashSoundRef.current && audioInitializedRef.current) {
      try {
        // Clone the audio to allow multiple simultaneous plays
        const audioClone = cashSoundRef.current.cloneNode() as HTMLAudioElement
        audioClone.currentTime = 0
        audioClone.volume = 0.7

        // Play the sound immediately
        audioClone
          .play()
          .then(() => {
            console.log("🎵 Som de cash tocado com sucesso!")
          })
          .catch((error) => {
            console.log("⚠️ Erro ao tocar áudio, usando fallback:", error)
            playFallbackCashSound()
          })
      } catch (error) {
        console.log("⚠️ Erro ao clonar áudio, usando fallback:", error)
        playFallbackCashSound()
      }
    } else {
      console.log("🔄 Áudio não inicializado, usando fallback")
      playFallbackCashSound()
    }
  }

  // Fallback cash sound using Web Audio API
  const playFallbackCashSound = () => {
    if (!audioContextRef.current) return

    try {
      // Verificar se o contexto está suspenso e tentar retomá-lo
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(console.error)
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.3)
    } catch (error) {
      console.error("Erro ao tocar som fallback:", error)
    }
  }

  // Play reward sound (for big wins)
  const playRewardSound = () => {
    if (!audioContextRef.current) return

    try {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(console.error)
      }

      // Create a more elaborate reward sound
      const oscillator1 = audioContextRef.current.createOscillator()
      const oscillator2 = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      // First tone
      oscillator1.frequency.setValueAtTime(523, audioContextRef.current.currentTime) // C5
      oscillator1.frequency.setValueAtTime(659, audioContextRef.current.currentTime + 0.1) // E5
      oscillator1.frequency.setValueAtTime(784, audioContextRef.current.currentTime + 0.2) // G5

      // Second tone (harmony)
      oscillator2.frequency.setValueAtTime(659, audioContextRef.current.currentTime) // E5
      oscillator2.frequency.setValueAtTime(784, audioContextRef.current.currentTime + 0.1) // G5
      oscillator2.frequency.setValueAtTime(1047, audioContextRef.current.currentTime + 0.2) // C6

      gainNode.gain.setValueAtTime(0.4, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5)

      oscillator1.start(audioContextRef.current.currentTime)
      oscillator1.stop(audioContextRef.current.currentTime + 0.5)
      oscillator2.start(audioContextRef.current.currentTime)
      oscillator2.stop(audioContextRef.current.currentTime + 0.5)
    } catch (error) {
      console.error("Erro ao tocar som de recompensa:", error)
    }
  }

  // Play click sound
  const playClickSound = () => {
    if (!audioContextRef.current) return

    try {
      // Verificar se o contexto está suspenso e tentar retomá-lo
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(console.error)
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(1000, audioContextRef.current.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.1)
    } catch (error) {
      console.error("Erro ao tocar som de clique:", error)
    }
  }

  // Play notification sound
  const playNotificationSound = () => {
    if (!audioContextRef.current) return

    try {
      // Verificar se o contexto está suspenso e tentar retomá-lo
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(console.error)
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime)
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.2)
    } catch (error) {
      console.error("Erro ao tocar som de notificação:", error)
    }
  }

  // Handle intro screen
  const handleStartChallenge = () => {
    playClickSound()
    setShowIntro(false)
    setShowHowItWorks(true)
  }

  // Handle how it works screen
  const handleStartNow = () => {
    playClickSound()
    setShowHowItWorks(false)
  }

  // Show confetti effect
  const showConfettiEffect = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [])

  // Show notification
  const showNotification = useCallback((notification: Omit<NotificationData, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])

    // Play cash sound for social proof (sales) and personal notifications
    if (notification.type === "social" || notification.type === "personal") {
      playCashSound() // Play cash sound for money-related notifications
    } else {
      playNotificationSound() // Play regular notification sound for other types
    }

    // Auto remove after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4000)
  }, [])

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // Add message with automatic cleanup
  const addMessage = useCallback((message: { type: "bot" | "user"; text: string; id: number }) => {
    setMessages((prev) => {
      const newMessages = [...prev, message]
      // Keep only the last MAX_VISIBLE_MESSAGES
      if (newMessages.length > MAX_VISIBLE_MESSAGES) {
        return newMessages.slice(-MAX_VISIBLE_MESSAGES)
      }
      return newMessages
    })
  }, [])

  // Handle product review
  const handleProductReview = () => {
    playClickSound()

    // Add bonus to balance
    const bonusAmount = 19.9
    setBalance((prev) => prev + bonusAmount)
    setProgress((prev) => prev + 15) // Extra progress for review

    // Show confetti and play reward sound
    showConfettiEffect()
    playRewardSound()

    // Show notification
    showNotification({
      type: "bonus",
      message: `🎉 Bônus de avaliação! +R$${bonusAmount.toFixed(2)} adicionados!`,
      position: "bottom",
    })

    // Hide review screen and continue
    setShowProductReview(false)
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setCurrentStep(3) // Continue to next question

      const botMessage = {
        type: "bot" as const,
        text: "Obrigado pela avaliação! Bônus especial desbloqueado. Vamos continuar:",
        id: Date.now(),
      }
      addMessage(botMessage)
    }, 2000)
  }

  // Handle roulette spin
  const handleRouletteSpin = () => {
    if (rouletteSpinning) return

    playClickSound()
    setRouletteSpinning(true)
    setRouletteResult(null)

    // Simulate spinning for 3 seconds, then land on 150
    setTimeout(() => {
      setRouletteResult(150)
      setRouletteSpinning(false)

      // Add bonus to balance
      setBalance((prev) => prev + 150)
      setProgress((prev) => prev + 20) // Extra progress for roulette

      // Show confetti and play reward sound
      showConfettiEffect()
      playRewardSound()

      // Show notification
      showNotification({
        type: "bonus",
        message: "🎰 JACKPOT! Você ganhou R$150,00 na roleta!",
        position: "bottom",
      })

      // Continue after showing result
      setTimeout(() => {
        setShowRoulette(false)
        setIsTyping(true)

        setTimeout(() => {
          setIsTyping(false)
          setCurrentStep(7) // Continue to next question

          const botMessage = {
            type: "bot" as const,
            text: "Que sorte incrível! R$150,00 na roleta! Vamos continuar:",
            id: Date.now(),
          }
          addMessage(botMessage)
        }, 1500)
      }, 3000)
    }, 3000)
  }

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    playClickSound()

    // Add user message
    const userMessage = { type: "user" as const, text: answer, id: Date.now() }
    addMessage(userMessage)

    // Update balance and progress
    const newBalance = balance + 10
    const newProgress = progress + 10

    setBalance(newBalance)
    setProgress(newProgress)
    playCashSound() // Play cash sound when balance increases

    // Show personal notification
    const personalMessages = [
      "+R$10,00 adicionado ao seu painel",
      "Você está mais perto do bônus!",
      "Saldo atualizado com sucesso!",
      "Mais R$10,00 na sua conta!",
      "Parabéns! +R$10,00 conquistados",
    ]

    showNotification({
      type: "personal",
      message: personalMessages[Math.floor(Math.random() * personalMessages.length)],
      position: "bottom",
    })

    // Show typing indicator
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)

      // Special handling for step 2 (show product review)
      if (currentStep === 2) {
        setShowProductReview(true)
        return
      }

      // Special handling for step 6 (show roulette)
      if (currentStep === 6) {
        setShowRoulette(true)
        return
      }

      // Check for bonus unlock (after 5th question)
      if (currentStep === 4) {
        showNotification({
          type: "bonus",
          message: "🎉 Bônus desbloqueado! Parabéns!",
          position: "top",
        })
        setShowBonus(true)
        return
      }

      // Check for final offer (after 10th question)
      if (currentStep === 9) {
        showNotification({
          type: "bonus",
          message: "🔓 Painel completo liberado!",
          position: "top",
        })
        setShowFinalOffer(true)
        return
      }

      // Move to next question
      setCurrentStep((prev) => prev + 1)

      // Add bot response
      const botMessage = {
        type: "bot" as const,
        text: `Perfeita escolha! +R$10,00 adicionados. ${currentStep < 9 ? "Próxima pergunta:" : ""}`,
        id: Date.now() + 1,
      }
      addMessage(botMessage)
    }, 2000)
  }

  // Continue from bonus screen
  const continueFromBonus = () => {
    playClickSound()
    setShowBonus(false)
    setCurrentStep(5)

    const botMessage = {
      type: "bot" as const,
      text: "Ótimo! Vamos continuar para desbloquear tudo:",
      id: Date.now(),
    }
    addMessage(botMessage)
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Calcular preço final com desconto
  const calculateFinalPrice = () => {
    const discountedPrice = Math.max(PRODUCT_PRICE - balance, 0)
    return discountedPrice
  }

  // Auto scroll when messages, typing state, or current step changes
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, currentStep, scrollToBottom])

  // Função para lidar com o clique no botão de compra
  const handlePurchaseClick = () => {
    playCashSound() // Tocar som de cash-in ao clicar
    // Aqui você pode adicionar a lógica para redirecionar para a página de checkout
    // window.location.href = "https://sua-url-de-checkout.com"
  }

  // Intro Screen
  if (showIntro) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col relative">
        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} onClose={() => removeNotification(notification.id)} />
          ))}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gray-900 p-3 md:p-4 flex justify-center items-center border-b border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C6FF00]" />
            <span className="font-bold text-lg">Desafio Interativo</span>
          </div>
        </div>

        {/* Intro Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-2xl w-full"
          >
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 md:p-8 border border-[#C6FF00] shadow-2xl">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
              </motion.div>

              <h1 className="text-2xl md:text-4xl font-bold mb-6 text-white leading-tight">
                Descubra como transformar seu tempo livre em <span className="text-[#C6FF00]">ganhos reais</span> com um
                simples <span className="text-[#00FFB2]">desafio interativo</span>
              </h1>

              <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
                Responda perguntas, avalie produtos, gire a roleta e acumule recompensas que desbloqueiam um{" "}
                <span className="text-[#C6FF00] font-semibold">guia prático completo</span> para sua primeira renda
                online — com <span className="text-[#00FFB2] font-semibold">bônus secreto incluído!</span>
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleStartChallenge}
                  className="bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] text-black font-bold py-4 px-8 rounded-full text-xl hover:shadow-lg hover:shadow-[#C6FF00]/20 transition-all"
                >
                  <Gift className="w-6 h-6 mr-3" />
                  Começar Desafio
                </Button>
              </motion.div>

              <div className="mt-6 text-gray-400 text-sm">
                <p>✨ Totalmente gratuito • ⏱️ Leva apenas 5 minutos • 🎁 Recompensas garantidas</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // How It Works Screen
  if (showHowItWorks) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col relative">
        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} onClose={() => removeNotification(notification.id)} />
          ))}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gray-900 p-3 md:p-4 flex justify-center items-center border-b border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C6FF00]" />
            <span className="font-bold text-lg">Como Funciona</span>
          </div>
        </div>

        {/* How It Works Content */}
        <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Como Funciona o <span className="text-[#C6FF00]">Desafio?</span>
            </h1>
          </motion.div>

          <div className="grid gap-6 md:gap-8 mb-8">
            {/* Step 1 */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#C6FF00]/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-xl">💰</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#C6FF00] mb-2">1. Acumule Ganhos</h3>
                  <p className="text-gray-300">
                    A cada pergunta respondida, você ganha <span className="text-[#C6FF00] font-semibold">R$10,00</span>{" "}
                    direto no seu painel. Mostre seu interesse e veja seu saldo crescer.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#C6FF00]/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#C6FF00] mb-2">2. Avalie Produtos</h3>
                  <p className="text-gray-300">
                    Na etapa 3 você terá a chance de avaliar um produto e ganhar{" "}
                    <span className="text-[#C6FF00] font-semibold">R$19,90</span> a mais com apenas 1 clique.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#C6FF00]/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-xl">🎰</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#C6FF00] mb-2">3. Gire a Roleta</h3>
                  <p className="text-gray-300">
                    Na etapa 7, desbloqueie a Roleta Premiada. Gire e receba até{" "}
                    <span className="text-[#C6FF00] font-semibold">R$150,00</span> em bônus imediato. É diversão com
                    recompensa real.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#C6FF00]/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#C6FF00] mb-2">4. Ganhe o Bônus Secreto</h3>
                  <p className="text-gray-300">
                    Só quem conclui o desafio garante o{" "}
                    <span className="text-[#C6FF00] font-semibold">Guia da Renda em 72 Horas</span> + um{" "}
                    <span className="text-[#00FFB2] font-semibold">bônus surpresa gratuito!</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleStartNow}
                className="bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] text-black font-bold py-4 px-8 rounded-full text-xl hover:shadow-lg hover:shadow-[#C6FF00]/20 transition-all mb-4"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                Começar Agora
              </Button>
            </motion.div>

            <p className="text-gray-400 text-sm">
              <span className="text-[#00FFB2] font-semibold">347 pessoas</span> já participaram hoje
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Product Review Screen
  if (showProductReview) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col relative">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} onClose={() => removeNotification(notification.id)} />
          ))}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gray-900 p-3 md:p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#C6FF00]" />
            <span className="font-bold text-sm md:text-base">Saldo: {formatCurrency(balance)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm">Avaliação</span>
            <Progress value={progress} className="w-16 md:w-20 h-2" />
            <span className="text-xs md:text-sm text-[#00FFB2]">{progress}%</span>
          </div>
        </div>

        {/* Product Review */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md w-full"
          >
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-[#C6FF00]">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#C6FF00]">🎁 Avaliação Surpresa!</h2>

              <p className="text-gray-300 mb-6">Avalie este produto e ganhe um bônus especial de R$19,90!</p>

              {/* Product Image */}
              <div className="mb-6">
                <div className="w-48 h-48 mx-auto rounded-lg overflow-hidden border border-[#C6FF00]/50">
                  <img
                    src="/images/kit-malbec.png"
                    alt="Kit Masculino Malbec (4 itens) - Boticário"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold mt-3">Kit Masculino Malbec (4 itens)</h3>
                <p className="text-gray-400 text-sm">Boticário - Linha Premium</p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-8 h-8 text-[#C6FF00] fill-current cursor-pointer hover:scale-110 transition-transform"
                  />
                ))}
              </div>

              <Button
                onClick={handleProductReview}
                className="bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform w-full"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Confirmar Avaliação (+R$19,90)
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Roulette Screen
  if (showRoulette) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col relative">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} onClose={() => removeNotification(notification.id)} />
          ))}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gray-900 p-3 md:p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#C6FF00]" />
            <span className="font-bold text-sm md:text-base">Saldo: {formatCurrency(balance)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm">Roleta</span>
            <Progress value={progress} className="w-16 md:w-20 h-2" />
            <span className="text-xs md:text-sm text-[#00FFB2]">{progress}%</span>
          </div>
        </div>

        {/* Roulette */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md w-full"
          >
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-[#C6FF00]">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#C6FF00]">🎰 Roleta da Sorte!</h2>

              <p className="text-gray-300 mb-6">Gire a roleta e ganhe um bônus especial!</p>

              {/* Roulette Wheel */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <motion.div
                  className="w-full h-full rounded-full border-8 border-[#C6FF00] relative overflow-hidden"
                  animate={rouletteSpinning ? { rotate: 1800 } : {}}
                  transition={{ duration: 3, ease: "easeOut" }}
                >
                  {ROULETTE_VALUES.map((value, index) => (
                    <div
                      key={index}
                      className={`absolute w-full h-full ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}`}
                      style={{
                        transform: `rotate(${(360 / ROULETTE_VALUES.length) * index}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((2 * Math.PI) / ROULETTE_VALUES.length)}% ${50 - 50 * Math.sin((2 * Math.PI) / ROULETTE_VALUES.length)}%)`,
                      }}
                    >
                      <div
                        className="absolute text-white font-bold text-sm"
                        style={{
                          top: "20%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        R${value}
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-[#C6FF00]"></div>
                </div>
              </div>

              {/* Result */}
              {rouletteResult && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6">
                  <div className="bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] text-black font-bold text-2xl py-3 px-6 rounded-full">
                    🎉 Você ganhou R${rouletteResult},00!
                  </div>
                </motion.div>
              )}

              {/* Spin Button */}
              {!rouletteSpinning && !rouletteResult && (
                <Button
                  onClick={handleRouletteSpin}
                  className="bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform w-full"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Girar Roleta
                </Button>
              )}

              {/* Spinning indicator */}
              {rouletteSpinning && <div className="text-[#C6FF00] font-bold text-lg animate-pulse">🎰 Girando...</div>}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (showBonus) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col relative">
        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} onClose={() => removeNotification(notification.id)} />
          ))}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gray-900 p-3 md:p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#C6FF00]" />
            <span className="font-bold text-sm md:text-base">Saldo: {formatCurrency(balance)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm">Bônus</span>
            <Progress value={progress} className="w-16 md:w-20 h-2" />
            <span className="text-xs md:text-sm text-[#00FFB2]">{progress}%</span>
          </div>
        </div>

        {/* Bonus Screen */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md w-full"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
              className="mb-6"
            >
              <Gift className="w-16 h-16 md:w-20 md:h-20 text-[#C6FF00] mx-auto" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#C6FF00] px-4">
              🎉 Você desbloqueou um bônus gratuito!
            </h2>

            <div className="mb-6">
              <p className="text-gray-400 line-through text-lg">De R$49,90</p>
              <p className="text-2xl font-bold text-[#00FFB2]">GRÁTIS!</p>
            </div>

            <p className="text-gray-300 mb-8 px-4">Continue para resgatar seu bônus exclusivo</p>

            <Button
              onClick={continueFromBonus}
              className="bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] text-black font-bold py-3 px-6 md:px-8 rounded-full hover:scale-105 transition-transform w-full md:w-auto"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Continuar para resgatar
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (showFinalOffer) {
    const finalPrice = calculateFinalPrice()

    return (
      <div className="min-h-screen bg-black text-white flex flex-col relative">
        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} onClose={() => removeNotification(notification.id)} />
          ))}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gray-900 p-3 md:p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#C6FF00]" />
            <span className="font-bold text-sm md:text-base">Saldo: {formatCurrency(balance)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm">Completo</span>
            <Progress value={100} className="w-16 md:w-20 h-2" />
            <span className="text-xs md:text-sm text-[#00FFB2]">100%</span>
          </div>
        </div>

        {/* Final Offer */}
        <div className="flex-1 p-4 space-y-6 max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 md:p-6 border border-[#C6FF00]"
          >
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-[#C6FF00] mx-auto mb-3" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#C6FF00]">DESBLOQUEADO!</h2>
              <p className="text-lg text-[#00FFB2] mt-2">🔓 Oferta VIP Liberada</p>
            </div>

            <div className="bg-black rounded-lg p-5 mb-6 border border-gray-800">
              <h3 className="text-xl md:text-2xl font-bold mb-3">Guia Renda em 72 Horas</h3>

              <div className="mb-4">
                <p className="text-[#C6FF00] font-bold text-lg mb-2">
                  🎉 Parabéns! Com seu esforço, você acumulou {formatCurrency(balance)} de saldo.
                </p>
                <p className="text-gray-300 text-sm mb-3">
                  Isso te garante um super desconto no nosso Guia Renda em 72 Horas.
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <p className="text-gray-400 line-through text-lg">De {formatCurrency(PRODUCT_PRICE)}</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#00FFB2]">
                    Por apenas {formatCurrency(finalPrice)}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 bg-[#C6FF00]/20 px-3 py-1 rounded-full border border-[#C6FF00]/50">
                  <p className="text-[#C6FF00] font-bold text-sm md:text-base">Desconto de {formatCurrency(balance)}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <div className="bg-[#C6FF00] rounded-full p-1 flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                  <p className="text-white text-sm">Guia completo para fazer sua 1ª venda em até 72 horas</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#C6FF00] rounded-full p-1 flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                  <p className="text-white text-sm">Bônus secreto gratuito (liberado após a compra)</p>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handlePurchaseClick}
                className="w-full bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] text-black font-bold py-4 rounded-full hover:shadow-lg hover:shadow-[#C6FF00]/20 transition-all text-lg"
              >
                🚀 Garantir meu acesso agora
              </Button>
            </motion.div>

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">Acesso imediato após a confirmação do pagamento</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-[#00FFB2]" />
              <p className="text-sm text-gray-300">
                <span className="text-[#00FFB2] font-medium">Lembrete:</span> Seu bônus exclusivo será liberado
                automaticamente após a finalização da compra.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification key={notification.id} {...notification} onClose={() => removeNotification(notification.id)} />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gray-900 p-3 md:p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#C6FF00]" />
          <motion.span
            key={balance}
            initial={{ scale: 1.2, color: "#C6FF00" }}
            animate={{ scale: 1, color: "#ffffff" }}
            className="font-bold text-sm md:text-base"
          >
            Saldo: {formatCurrency(balance)}
          </motion.span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm">Bônus</span>
          <Progress value={progress} className="w-16 md:w-20 h-2" />
          <span className="text-xs md:text-sm text-[#00FFB2]">{progress}%</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-3 md:p-4 space-y-4 overflow-hidden" ref={chatContainerRef}>
        {/* Welcome message - only show if no messages yet */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-3 md:p-4 max-w-xs md:max-w-sm"
          >
            <p className="text-sm">
              👋 Olá! Vamos começar sua jornada para ganhar dinheiro online. A cada resposta, você ganha R$10,00!
            </p>
          </motion.div>
        )}

        {/* Messages - only show recent ones */}
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg p-3 max-w-xs md:max-w-sm ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] text-black"
                    : "bg-gray-800 text-white"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3 max-w-xs">
              <div className="flex space-x-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                  className="w-2 h-2 bg-[#00FFB2] rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                  className="w-2 h-2 bg-[#00FFB2] rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                  className="w-2 h-2 bg-[#00FFB2] rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Question */}
        {currentStep < questions.length && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-sm md:text-lg">💰</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[#C6FF00] text-xs md:text-sm font-semibold">+R$10,00 por resposta</p>
                  <p className="text-gray-400 text-xs">
                    Pergunta {currentStep + 1} de {questions.length}
                  </p>
                </div>
              </div>
              <p className="text-white font-medium text-base md:text-lg leading-relaxed">
                {questions[currentStep].text}
              </p>
            </div>

            <div className="space-y-3">
              {questions[currentStep].options.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleAnswer(option)}
                    className="w-full justify-start text-left p-3 md:p-4 h-auto bg-gray-900 border-2 border-gray-700 hover:border-[#C6FF00] hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900 hover:shadow-lg hover:shadow-[#C6FF00]/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#C6FF00] to-[#00FFB2] flex items-center justify-center text-black font-bold text-xs md:text-sm group-hover:scale-110 transition-transform flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-white group-hover:text-[#C6FF00] transition-colors font-medium text-sm md:text-base truncate">
                          {option}
                        </span>
                      </div>
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-600 group-hover:border-[#00FFB2] group-hover:bg-[#00FFB2]/20 transition-all flex items-center justify-center flex-shrink-0 ml-2">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-[#00FFB2] opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.2 }}
                        />
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Elemento para inicializar áudio sem bloquear cliques */}
      <div
        onClick={() => {
          if (cashSoundRef.current && !audioInitializedRef.current) {
            cashSoundRef.current
              .play()
              .then(() => {
                cashSoundRef.current!.pause()
                cashSoundRef.current!.currentTime = 0
                audioInitializedRef.current = true
                console.log("✅ Áudio inicializado manualmente!")
              })
              .catch(console.error)
          }

          // Também tenta retomar o contexto de áudio
          if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume().catch(console.error)
          }
        }}
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  )
}
