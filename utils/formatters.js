export const spinWheel = (segments) => {
  const segmentAngle = 360 / segments.length;
  const randomIndex = Math.floor(Math.random() * segments.length);
  const extraSpins = 360 * 5;
  const stopAngle = extraSpins + (randomIndex * segmentAngle) + (segmentAngle / 2);
  
  const winningIndex = (segments.length - 1 - randomIndex + segments.length) % segments.length;
  
  return {
    stopAngle,
    winningPrize: segments[winningIndex],
    winningIndex,
  };
};

export const getRandomPrize = (outcomes) => {
  const randomIndex = Math.floor(Math.random() * outcomes.length);
  return outcomes[randomIndex];
};

export const formatPoints = (points) => {
  return points.toLocaleString();
};

export const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

export const calculatePointsFromSpend = (spend, rate = 1) => {
  return Math.floor(parseFloat(spend) * rate);
};

export const calculateDiscount = (amount, percentage) => {
  return parseFloat(amount) * (parseFloat(percentage) / 100);
};

export const calculatePointsValue = (points, rate = 0.01) => {
  return points * rate;
};