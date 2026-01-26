export interface FootballApiFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface FootballApiResponse {
  response: FootballApiFixture[];
}

const API_HOST = "v3.football.api-sports.io";
const LEAGUE_ID = 2; // Champions League
const SEASON = 2024; // 2024/2025 season

export class FootballApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchFromApi(endpoint: string, params: Record<string, string> = {}): Promise<FootballApiResponse> {
    const url = new URL(`https://${API_HOST}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Football API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetches fixtures for the Champions League season.
   */
  async getFixtures(from?: string, to?: string): Promise<FootballApiFixture[]> {
    const params: Record<string, string> = {
      league: LEAGUE_ID.toString(),
      season: SEASON.toString(),
    };

    if (from) params.from = from;
    if (to) params.to = to;

    const data = await this.fetchFromApi("fixtures", params);
    return data.response;
  }

  /**
   * Fetches currently live fixtures for the Champions League.
   */
  async getLiveFixtures(): Promise<FootballApiFixture[]> {
    const data = await this.fetchFromApi("fixtures", {
      league: LEAGUE_ID.toString(),
      season: SEASON.toString(),
      live: "all",
    });
    return data.response;
  }
}
