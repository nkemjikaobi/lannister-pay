const checkLocale = (currencyCountry, country) => {
	if (currencyCountry === country) {
		return 'LOCL';
	}
	return 'INTL';
};

const FEE_ENTITYS = [
	'CREDIT-CARD',
	'DEBIT-CARD',
	'BANK-ACCOUNT',
	'USSD',
	'WALLET-ID',
];
module.exports = { checkLocale, FEE_ENTITYS };
