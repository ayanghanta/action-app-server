exports.calcMinBidAmount = (currentBidAmount) => {
  //  NEW BID MUST ME 10% HICK ON THE CURRENT BID
  return currentBidAmount + (process.env.PRICE_HIKE / 100) * currentBidAmount;
};
