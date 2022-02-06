const express = require('express');
const router = express.Router();

const redis = require('redis');
const redisPort = 6379;
const client = redis.createClient(redisPort);
const { checkLocale, FEE_ENTITYS } = require('../helpers/helpers');

//@route   POST fees
//@desc    Add new configuration
//@access  Public
router.post('/fees', async (req, res) => {
	try {
		const configuration = req.body.FeeConfigurationSpec;
		await client.connect();

		await client.set('fee-config', JSON.stringify(configuration));
		const data = await client.get('fee-config');

		const splitData = JSON.parse(data).split('\n');
		let current = [];
		let formattedConfig = [];
		let formatedData;

		for (let i = 0; i < splitData.length; i++) {
			current.push(splitData[i]);
		}
		for (let i = 0; i < current.length; i++) {
			const splitCurrent = current[i].split(' ');
			formatedData = {
				configuration: 0,
				feeId: splitCurrent[0],
				feeCurrency: splitCurrent[1],
				feeLocale: splitCurrent[2],
				feeEntityAndProperty: splitCurrent[3],
				columnPunctuation: splitCurrent[4],
				apply: splitCurrent[5],
				feeType: splitCurrent[6],
				feeValue: splitCurrent[7],
			};
			formattedConfig.push(formatedData);
			await client.set('formatted-config', JSON.stringify(formattedConfig));
		}
		process.on('SIGINT', function () {
			client.quit();
			console.log('redis client quit');
		});
		return res.json({ status: 'ok' });
	} catch (error) {
		console.log('error occured', error);
		return;
	}
});

//@route   POST compute-transaction-fee
//@desc    Compute transaction fee
//@access  Public
router.post('/compute-transaction-fee', async (req, res) => {
	try {
		await client.connect();
		const configurations = await client.get('formatted-config');
		const newConfig = JSON.parse(configurations);
		const payload = req.body;

		const currency = payload.Currency;
		const locale = checkLocale(payload.CurrencyCountry, payload.Country);
		const type = payload.PaymentEntity.Type;
		const brand = payload.PaymentEntity.Brand;

		for (let i = 0; i < newConfig.length; i++) {
			if (newConfig[i].feeCurrency === currency) {
				newConfig[i].configuration++;
				await client.set(
					'formatted-config',
					JSON.stringify({
						...newConfig[i],
						configuration: newConfig[i].configuration++,
					})
				);
			} else if (newConfig[i].feeLocale === locale) {
				newConfig.configuration++;
				await client.set(
					'formatted-config',
					JSON.stringify({
						...newConfig[i],
						configuration: newConfig[i].configuration++,
					})
				);
			} else if (newConfig[i].feeEntityAndProperty.includes(type)) {
				newConfig[i].configuration++;
				await client.set(
					'formatted-config',
					JSON.stringify({
						...newConfig[i],
						configuration: newConfig[i].configuration++,
					})
				);
			} else if (newConfig[i].feeEntityAndProperty.includes(brand)) {
				newConfig[i].configuration++;
				await client.set(
					'formatted-config',
					JSON.stringify({
						...newConfig[i],
						configuration: newConfig[i].configuration++,
					})
				);
			}
		}
		console.log(newConfig);

		const finalResult = {
			AppliedFeeID: 'LNPY0222',
			AppliedFeeValue: 230,
			ChargeAmount: 5230,
			SettlementAmount: payload.Amount,
		};
		process.on('SIGINT', function () {
			client.quit();
			console.log('redis client quit');
		});
		return res.json(finalResult);
	} catch (error) {
		console.log('error occured', error);
		return;
	}
});

module.exports = router;
