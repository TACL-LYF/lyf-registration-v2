/**
 * Create the discount name based on sibling discount and camp credit
 * @param siblingDiscountAmount
 * @param campCreditUsed
 * @returns
 */
export function createDiscountName(
  siblingDiscountAmount: number,
  campCreditUsed: number
) {
  const discountName = [];
  if (siblingDiscountAmount > 0) {
    discountName.push(`$${siblingDiscountAmount} Sibling Discount`);
  }

  if (campCreditUsed > 0) {
    discountName.push(`$${campCreditUsed} Camp Credit`);
  }

  return discountName.join(" + ");
}
