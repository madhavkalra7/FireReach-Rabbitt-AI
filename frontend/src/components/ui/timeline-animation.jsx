import { motion } from 'framer-motion'

export function TimelineContent({
  as = 'div',
  children,
  className,
  customVariants,
  animationNum = 0,
}) {
  const Comp = motion[as] || motion.div

  return (
    <Comp
      className={className}
      variants={customVariants}
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </Comp>
  )
}
