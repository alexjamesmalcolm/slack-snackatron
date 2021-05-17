export const formatMoney = (money: number): string =>
  `$${new Number(money).toFixed(2)}`;
