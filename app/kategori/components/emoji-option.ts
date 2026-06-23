import type { TranslationMap } from "@/lib/i18n/use-translate";

export interface EmojiOption {
  hexcode: string;
  label: string;
  group: string;
}

export function getEmojiOptions(CONSTANT: TranslationMap): EmojiOption[] {
  return [
    // ── Keuangan ──────────────────────────────────────────────────────────────
    { hexcode: "1F4B0", label: CONSTANT.emojiCoin, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B5", label: CONSTANT.emojiBanknote, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B3", label: CONSTANT.emojiCreditCard, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B8", label: CONSTANT.emojiMoneyWings, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B9", label: CONSTANT.emojiChartUp, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F3E6", label: CONSTANT.emojiBank, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B1", label: CONSTANT.emojiCurrencyExchange, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1FA99", label: CONSTANT.emojiCoinAlt, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B2", label: CONSTANT.emojiDollar, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B4", label: CONSTANT.emojiYen, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B6", label: CONSTANT.emojiEuro, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4B7", label: CONSTANT.emojiPound, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4CA", label: CONSTANT.emojiStats, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F4C9", label: CONSTANT.emojiChartDown, group: CONSTANT.emojiGroupFinance },
    { hexcode: "1F516", label: CONSTANT.emojiBookmark, group: CONSTANT.emojiGroupFinance },

    // ── Makanan & Minuman ─────────────────────────────────────────────────────
    { hexcode: "1F35C", label: CONSTANT.emojiRamen, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F372", label: CONSTANT.emojiSoto, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F35B", label: CONSTANT.emojiCurry, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F354", label: CONSTANT.emojiBurger, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F355", label: CONSTANT.emojiPizza, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F35F", label: CONSTANT.emojiFries, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F371", label: CONSTANT.emojiBento, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F96A", label: CONSTANT.emojiSandwich, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F366", label: CONSTANT.emojiIceCream, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F370", label: CONSTANT.emojiCake, group: CONSTANT.emojiGroupFood },
    { hexcode: "2615", label: CONSTANT.emojiCoffee, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F9CB", label: CONSTANT.emojiBubbleTea, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F37A", label: CONSTANT.emojiBeer, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F964", label: CONSTANT.emojiDrink, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F9FA", label: CONSTANT.emojiGrocery, group: CONSTANT.emojiGroupFood },
    { hexcode: "1F34E", label: CONSTANT.emojiFruit, group: CONSTANT.emojiGroupFood },

    // ── Transportasi ─────────────────────────────────────────────────────────
    { hexcode: "1F697", label: CONSTANT.emojiCar, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F68C", label: CONSTANT.emojiBus, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F682", label: CONSTANT.emojiTrain, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F6B2", label: CONSTANT.emojiBicycle, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F6F5", label: CONSTANT.emojiMotorcycle, group: CONSTANT.emojiGroupTransport },
    { hexcode: "2708", label: CONSTANT.emojiPlane, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F6A2", label: CONSTANT.emojiShip, group: CONSTANT.emojiGroupTransport },
    { hexcode: "26FD", label: CONSTANT.emojiFuel, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F17F", label: CONSTANT.emojiParking, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F695", label: CONSTANT.emojiTaxi, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F6EB", label: CONSTANT.emojiDeparture, group: CONSTANT.emojiGroupTransport },
    { hexcode: "1F9F3", label: CONSTANT.emojiLuggage, group: CONSTANT.emojiGroupTransport },

    // ── Belanja ───────────────────────────────────────────────────────────────
    { hexcode: "1F6CD", label: CONSTANT.emojiShoppingBag, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F6D2", label: CONSTANT.emojiShoppingCart, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F381", label: CONSTANT.emojiGift, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F4E6", label: CONSTANT.emojiPackage, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F455", label: CONSTANT.emojiShirt, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F457", label: CONSTANT.emojiDress, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F45F", label: CONSTANT.emojiShoes, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F453", label: CONSTANT.emojiGlasses, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F484", label: CONSTANT.emojiCosmetics, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F48D", label: CONSTANT.emojiJewelry, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F4F1", label: CONSTANT.emojiPhone, group: CONSTANT.emojiGroupShopping },
    { hexcode: "1F5A5", label: CONSTANT.emojiComputer, group: CONSTANT.emojiGroupShopping },

    // ── Rumah & Tagihan ───────────────────────────────────────────────────────
    { hexcode: "1F3E0", label: CONSTANT.emojiHouse, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F6CB", label: CONSTANT.emojiFurniture, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F4A1", label: CONSTANT.emojiElectricity, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F6B0", label: CONSTANT.emojiWater, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F525", label: CONSTANT.emojiGas, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F528", label: CONSTANT.emojiRepair, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F4FA", label: CONSTANT.emojiInternet, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F9F9", label: CONSTANT.emojiCleaning, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F511", label: CONSTANT.emojiRent, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F6AA", label: CONSTANT.emojiDoor, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F9F4", label: CONSTANT.emojiKitchen, group: CONSTANT.emojiGroupHome },
    { hexcode: "1F6D1", label: CONSTANT.emojiInsurance, group: CONSTANT.emojiGroupHome },

    // ── Kesehatan ─────────────────────────────────────────────────────────────
    { hexcode: "1F3E5", label: CONSTANT.emojiHospital, group: CONSTANT.emojiGroupHealth },
    { hexcode: "1F48A", label: CONSTANT.emojiMedicine, group: CONSTANT.emojiGroupHealth },
    { hexcode: "1FA7A", label: CONSTANT.emojiDoctor, group: CONSTANT.emojiGroupHealth },
    { hexcode: "1F9EA", label: CONSTANT.emojiVitamin, group: CONSTANT.emojiGroupHealth },
    { hexcode: "1F3CB", label: CONSTANT.emojiGym, group: CONSTANT.emojiGroupHealth },
    { hexcode: "1F9D8", label: CONSTANT.emojiYoga, group: CONSTANT.emojiGroupHealth },
    { hexcode: "1F6C1", label: CONSTANT.emojiSelfCare, group: CONSTANT.emojiGroupHealth },
    { hexcode: "1FAE6", label: CONSTANT.emojiDental, group: CONSTANT.emojiGroupHealth },
    { hexcode: "1F9E0", label: CONSTANT.emojiMentalHealth, group: CONSTANT.emojiGroupHealth },
    { hexcode: "2764", label: CONSTANT.emojiHeart, group: CONSTANT.emojiGroupHealth },

    // ── Hiburan ───────────────────────────────────────────────────────────────
    { hexcode: "1F3B5", label: CONSTANT.emojiMusic, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F3AE", label: CONSTANT.emojiGame, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F3AC", label: CONSTANT.emojiMovie, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F4DA", label: CONSTANT.emojiBook, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F3A8", label: CONSTANT.emojiArt, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F4F7", label: CONSTANT.emojiPhoto, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F3A4", label: CONSTANT.emojiKaraoke, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "26BD", label: CONSTANT.emojiSports, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F3D6", label: CONSTANT.emojiBeach, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F3D4", label: CONSTANT.emojiMountain, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F3AA", label: CONSTANT.emojiEvent, group: CONSTANT.emojiGroupEntertain },
    { hexcode: "1F9E9", label: CONSTANT.emojiHobby, group: CONSTANT.emojiGroupEntertain },

    // ── Pendidikan ────────────────────────────────────────────────────────────
    { hexcode: "1F393", label: CONSTANT.emojiSchool, group: CONSTANT.emojiGroupEducation },
    { hexcode: "1F4D6", label: CONSTANT.emojiCourse, group: CONSTANT.emojiGroupEducation },
    { hexcode: "270F", label: CONSTANT.emojiStationery, group: CONSTANT.emojiGroupEducation },
    { hexcode: "1F4BB", label: CONSTANT.emojiLaptop, group: CONSTANT.emojiGroupEducation },
    { hexcode: "1F310", label: CONSTANT.emojiOnlineCourse, group: CONSTANT.emojiGroupEducation },
    { hexcode: "1F9D1-200D-1F4BB", label: CONSTANT.emojiTutoring, group: CONSTANT.emojiGroupEducation },
    { hexcode: "1F4C3", label: CONSTANT.emojiTuition, group: CONSTANT.emojiGroupEducation },

    // ── Pemasukan ─────────────────────────────────────────────────────────────
    { hexcode: "1F4BC", label: CONSTANT.emojiSalary, group: CONSTANT.emojiGroupIncome },
    { hexcode: "1F3E2", label: CONSTANT.emojiBusiness, group: CONSTANT.emojiGroupIncome },
    { hexcode: "2B50", label: CONSTANT.emojiBonus, group: CONSTANT.emojiGroupIncome },
    { hexcode: "1F91D", label: CONSTANT.emojiFreelance, group: CONSTANT.emojiGroupIncome },
    { hexcode: "1F4C8", label: CONSTANT.emojiInvestment, group: CONSTANT.emojiGroupIncome },
    { hexcode: "1FA84", label: CONSTANT.emojiPassiveIncome, group: CONSTANT.emojiGroupIncome },
    { hexcode: "1F38A", label: CONSTANT.emojiThr, group: CONSTANT.emojiGroupIncome },
    { hexcode: "1F4E9", label: CONSTANT.emojiTransferIn, group: CONSTANT.emojiGroupIncome },

    // ── Lainnya ───────────────────────────────────────────────────────────────
    { hexcode: "1F4AC", label: CONSTANT.emojiOther, group: CONSTANT.emojiGroupOther },
    { hexcode: "2753", label: CONSTANT.emojiUnexpected, group: CONSTANT.emojiGroupOther },
    { hexcode: "26A1", label: CONSTANT.emojiEmergency, group: CONSTANT.emojiGroupOther },
    { hexcode: "1F4E4", label: CONSTANT.emojiTransferOut, group: CONSTANT.emojiGroupOther },
    { hexcode: "1F4DD", label: CONSTANT.emojiNote, group: CONSTANT.emojiGroupOther },
    { hexcode: "1F512", label: CONSTANT.emojiSavings, group: CONSTANT.emojiGroupOther },
    { hexcode: "267B", label: CONSTANT.emojiInstallment, group: CONSTANT.emojiGroupOther },
    { hexcode: "1F4CB", label: CONSTANT.emojiReport, group: CONSTANT.emojiGroupOther },
  ];
}

// backward compat — untuk komponen yang belum migrasi
export const EMOJI_OPTIONS = getEmojiOptions({} as TranslationMap);