import os
import requests
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("API_KEY")
# Plot


def plot_gdp_analysis(country):
    countryname = country.title()
    url = f"https://api.tradingeconomics.com/historical/country/{country}/indicator/gdp?c={api_key}"
    data = requests.get(url).json()
    # Extract and format dates and values
    dates = [
        datetime.strptime(item["DateTime"][:19], "%Y-%m-%dT%H:%M:%S").year
        for item in data
        if "Country" in item
    ]
    values = [item["Value"] for item in data if "Country" in item]

    # Calculate yearly growth rates
    growth_rates = [0] + [
        (values[i] - values[i - 1]) / values[i - 1] * 100 for i in range(1, len(values))
    ]

    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)

    # Plot 1: GDP Values (Logarithmic Scale)
    ax1.plot(dates, values, marker="o", linestyle="-", color="#1f77b4", label="GDP (USD)")
    ax1.set_title(
        f"{countryname} GDP Growth (1960-2023) - Logarithmic Scale", fontsize=14, fontweight="bold"
    )
    ax1.set_ylabel("GDP (USD, log scale)", fontsize=12)
    ax1.set_yscale("log")  # Set logarithmic scale
    ax1.grid(True, which="both", linestyle="--", linewidth=0.5)
    ax1.legend()

    # Plot 2: Yearly Growth Rates
    ax2.bar(dates, growth_rates, color="#2ca02c", alpha=0.7, label="Yearly Growth")
    ax2.axhline(y=0, color="black", linestyle="-", linewidth=0.5)
    ax2.set_title("Yearly GDP Growth Rate (%)", fontsize=14)
    ax2.set_xlabel("Year", fontsize=12)
    ax2.set_ylabel("Growth Rate (%)", fontsize=12)
    ax2.grid(True, which="major", linestyle="--", linewidth=0.5)
    ax2.legend()

    # Add value labels for every 5 years
    for i in range(0, len(dates), 5):
        year = dates[i]
        value = values[i]
        growth = growth_rates[i]

        ax1.annotate(
            f"{value:.1f}B",
            xy=(year, value),
            xytext=(0, 5),
            textcoords="offset points",
            ha="center",
        )

        ax2.annotate(
            f"{growth:.1f}%",
            xy=(year, growth),
            xytext=(0, 5) if growth >= 0 else (0, -15),
            textcoords="offset points",
            ha="center",
        )

    plt.tight_layout()

    # Save and show
    plt.savefig(f"{country}_gdp_analysis.png", dpi=300, bbox_inches="tight")
    plt.show()

if __name__ == "__main__":
    countries = [
        "mexico",
        "sweden",
        "new zealand",
        "thailand"
    ]
    for country in countries:
        plot_gdp_analysis(country)