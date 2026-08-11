

// Icon Mapping
// export const iconMap: Record<string, React.ElementType> = {
//   "/": BiHomeSmile,
//   "/about": BiUser,
//   "/contact": HiOutlineChatBubbleBottomCenterText,
//   "/reservation": TbBrandBooking,
// };

// Framer Motion Variants
export const framerMenuBackground = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.2 } },
  transition: { duration: 0.3 },
};

export const framerMenuPanel = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" },
  transition: { duration: 0.3 },
};

export const framerText = (delay: number) => ({
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  transition: {
    delay: 0.5 + delay / 10,
  },
});

export const framerIcon = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 20,
    delay: 1.5,
  },
};
