const currencySymbols: Record<string,string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    RON: "lei",
    JPY: "¥",
    CNY: "¥",
    CHF: "CHF",
    RUB: "₽"
}

function toStars(nb:number,max:number):number[] {
    const decimal = nb % 1
    if (decimal < 0.25) {
        const nb_star = Math.trunc(nb)
        return [nb_star,0,max-nb_star]
    } else if ( decimal > 0.75) {
        const nb_star = Math.trunc(nb) + 1
        return [nb_star,0,max-nb_star]
    } else {
        const nb_star = Math.trunc(nb)
        return [nb_star,1,max-nb_star-1]
    }
}


export function ratingToStars(rating:number | undefined, max=5): string {
    if (!rating) {
        return "No Rating"
    }
    const [full,half,empty] = ['★','⯪','☆']
    const nb_stars = toStars(rating,max)

    const res = full.repeat(nb_stars[0]) + half.repeat(nb_stars[1]) + empty.repeat(nb_stars[2]);
    return res
}

export function currToSymbol(currency:string): string {
    return currencySymbols[currency]
} 

export function AverageRating(reviews_sum:number,reviews_count:number):string {
    return (reviews_sum/(10*reviews_count)).toFixed(1);
}