export const calcMinBidAmount = (currentBidAmount) => {
  //  NEW BID MUST ME 10% HICK ON THE CURRENT BID
  return currentBidAmount + (process.env.PRICE_HIKE / 100) * currentBidAmount;
};
export function calcDeliveryDate(minDays = 1, maxDays = 7) {
  // Generate a random day in the future
  const daysToAdd =
    Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;

  // Create the base date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);

  // Generate a random hour between 5 AM (5) and 9 PM (21)
  const randomHour = Math.floor(Math.random() * (21 - 5 + 1)) + 5;
  const randomMinute = Math.floor(Math.random() * 60);

  deliveryDate.setHours(randomHour, randomMinute, 0, 0);

  return deliveryDate;
}
