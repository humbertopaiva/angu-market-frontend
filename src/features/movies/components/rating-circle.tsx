import React, { useEffect, useState } from 'react'

interface RatingCircleProps {
  rating: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  className?: string
}

export const RatingCircle: React.FC<RatingCircleProps> = ({
  rating,
  size = 60,
  strokeWidth = 6,
  showValue = true,
  className = '',
}) => {
  // States para controlar as animações
  const [isVisible, setIsVisible] = useState(false)
  const [animatedRating, setAnimatedRating] = useState(0)

  // Normalizar a classificação para escala 0-100
  const normalizedRating = (animatedRating / 10) * 100

  // Valor formatado como porcentagem (arredondado para número inteiro)
  const percentageValue = Math.round(normalizedRating)

  // Calcular o raio e a circunferência
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  // Calcular o tamanho do arco preenchido
  const fillPercentage = normalizedRating / 100
  const dashOffset = circumference * (1 - fillPercentage)

  // Determinar a cor com base na classificação
  const getColor = () => {
    if (normalizedRating >= 75) return '#22c55e' // Verde para boas avaliações
    if (normalizedRating >= 50) return '#eab308' // Amarelo para médias
    return '#ef4444' // Vermelho para baixas
  }

  const currentColor = getColor()

  useEffect(() => {
    const entryTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(entryTimer)
  }, [])

  useEffect(() => {
    if (isVisible) {
      const duration = 1000
      const steps = 60
      const stepValue = rating / steps
      let currentStep = 0

      const animationTimer = setInterval(() => {
        currentStep += 1
        const nextValue = Math.min(stepValue * currentStep, rating)
        setAnimatedRating(nextValue)

        if (currentStep >= steps) {
          clearInterval(animationTimer)
        }
      }, duration / steps)

      return () => clearInterval(animationTimer)
    }
  }, [isVisible, rating])

  return (
    <div
      className={`relative ${className} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transition: 'opacity 0.5s ease-in-out' }}
    >
      {/* SVG com o fundo circular escuro e borda cinza */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        {/* Círculo com fundo escuro e borda cinza clara */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="rgba(0,0,0,0.6)"
          stroke="rgba(200,200,200,0.3)"
          strokeWidth={strokeWidth}
          filter="blur(1px)"
          className={`${isVisible ? 'animate-pulse-subtle' : ''}`}
          style={{ animation: 'pulse 3s ease-in-out infinite' }}
        />
      </svg>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 relative z-10"
      >
        {/* Círculo de progresso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>

      {/* Texto da avaliação */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center text-center z-20">
          <div className="flex items-center gap-0.5">
            <span
              className="font-bold flex items-end justify-end"
              style={{
                fontSize: size * 0.3,
                color: currentColor,
                transition: 'color 0.3s ease-out',
              }}
            >
              {percentageValue}
            </span>
            <span
              className="text-white mt-1"
              style={{
                opacity: animatedRating > 0 ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
              }}
            >
              %
            </span>
          </div>
        </div>
      )}

      {/* Estilo CSS para animação personalizada */}
      <style>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}
