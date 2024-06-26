"use client";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useQuery } from "react-query";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "@/components/Container";
import convertKelvinToCelcius from "@/utils/convertKelvinToCelcius";
import WeatherIcon from "@/components/WeatherIcon";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import WeatherDetail from "@/components/WeatherDetail";
import { metersToKilometers } from "@/utils/metersToKilometers";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import { useAtom } from "jotai";
import { loadCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";
import WeatherSkeleton from "@/components/WeatherSkeleton";

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}
interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

const apiKey = process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY;

export default function Home() {
  //default city on app load
  const [firstPlace, setFirstPlace] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherData>(
    "apiData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${firstPlace}&appid=${apiKey}&cnt=56`
      );
      return data;
    }
  );

  useEffect(() => {
    refetch();
  }, [firstPlace, refetch]);

  const firstData = data?.list[0];

  // getting the forecast data
  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];
  // filtering data to get the first entry after 6AM for each unique date
  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading....</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
            {/* today's data */}
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl items-end">
                  <p className="text-gray-500 text-2xl">
                    {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}
                  </p>
                  <p className="text-gray-500 text-lg">
                    ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")})
                  </p>
                </h2>
                <Container className="gap-10 px-6 items-center">
                  {/* temperature */}
                  <div className="flex flex-col px-4  text-gray-500">
                    <span className="text-5xl">
                      {convertKelvinToCelcius(firstData?.main.temp ?? 0)}°
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span>Feels like</span>
                      <span>
                        {convertKelvinToCelcius(firstData?.main.temp ?? 0)}°
                      </span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>
                        {convertKelvinToCelcius(firstData?.main.temp_max ?? 0)}
                        °↑
                      </span>
                      <span>
                        {convertKelvinToCelcius(firstData?.main.temp_min ?? 0)}
                        °↓
                      </span>
                    </p>
                  </div>
                  {/* time and weather icon */}
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3 text-gray-500">
                    {data?.list.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                      >
                        <p className=" whitespace-nowrap">
                          {format(parseISO(d.dt_txt), "h:mm a")}
                        </p>
                        <WeatherIcon
                          iconname={getDayOrNightIcon(
                            d.weather[0].icon,
                            d.dt_txt
                          )}
                        />
                        <p>{convertKelvinToCelcius(d?.main.temp ?? 0)}°</p>
                      </div>
                    ))}
                  </div>
                </Container>
              </div>
              <div className="text-gray-500 flex gap-4">
                {/* left */}
                <Container className="w-fit justify-center flex-col px-4 items-center">
                  <p className="capitalize text-center">
                    {firstData?.weather[0].description}
                  </p>
                  <WeatherIcon
                    iconname={getDayOrNightIcon(
                      firstData?.weather[0].icon ?? "",
                      firstData?.dt_txt ?? ""
                    )}
                  />
                </Container>
                {/* right */}
                <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetail
                    visibility={metersToKilometers(
                      firstData?.visibility ?? 10000
                    )}
                    airPressure={`${firstData?.main.pressure} hPa`}
                    humidity={`${firstData?.main.humidity}%`}
                    windSpeed={convertWindSpeed(firstData?.wind.speed ?? 0)}
                    sunrise={format(
                      fromUnixTime(data?.city.sunrise ?? 1707450152),
                      "H:mm"
                    )}
                    sunset={format(
                      fromUnixTime(data?.city.sunset ?? 1707493947),
                      "H:mm"
                    )}
                  />
                </Container>
              </div>
            </section>
            {/* 7 day forecast */}
            <section className="text-gray-500 flex w-full flex-col gap-4">
              <p className="text-2xl">Forecast (7 Days)</p>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetail
                  key={i}
                  weatherIcon={d?.weather[0].icon ?? "01d"}
                  description={d?.weather[0].description ?? ""}
                  date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
                  day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_min={d?.main?.temp_min ?? 0}
                  temp_max={d?.main?.temp_max ?? 0}
                  airPressure={`${d?.main.pressure} hPa`}
                  humidity={`${d?.main.humidity}%`}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 1707450152),
                    "H:mm"
                  )}
                  sunset={format(
                    fromUnixTime(data?.city.sunset ?? 1707493947),
                    "H:mm"
                  )}
                  visibility={`${metersToKilometers(d?.visibility ?? 10000)}km`}
                  windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)}`}
                />
              ))}
            </section>{" "}
          </>
        )}
      </main>
    </div>
  );
}
