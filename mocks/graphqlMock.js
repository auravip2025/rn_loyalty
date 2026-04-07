export const GET_MERCHANTS = `
  query GetMerchants {
    merchants { id name category categoryEmoji distance rating reviewCount open address phone hours website image description tags visitCount programs { id name desc active icon color segments } offers { id title desc discount expires } reviews { author rating text date } }
  }
`;

export const GET_PROGRAMS = `
  query GetPrograms {
    programs {
      id name desc active color icon segments { label color type value }
    }
  }
`;

export const GET_WALLET = `
  query GetWallet {
    wallet {
      balance transactions { id merchant amount type date }
    }
  }
`;

export const GET_DAILY_QUESTS = `
  query GetDailyQuests {
    dailyQuests {
      id title desc points icon completed
    }
  }
`;

export const GET_OFFERS = `
  query GetOffers {
    offers {
      id title desc image price
    }
    storeMenus {
      storeName items { id title price image }
    }
  }
`;

export const DEDUCT_POINTS = `mutation DeductPoints($amount: Int!, $merchant: String!) { deductPoints(amount: $amount, merchant: $merchant) { success wallet { balance } } }`;
export const EARN_POINTS = `mutation EarnPoints($amount: Int!, $merchant: String!) { earnPoints(amount: $amount, merchant: $merchant) { success wallet { balance } } }`;
