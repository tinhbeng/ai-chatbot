'use client';
import { TokenTrending, TokenTrendingV2 } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

const TrendingToken = ({data}: {data?: TokenTrending[]}) => {
    if (!data) return null

    return (
        <ul className='grid grid-cols-1 gap-2'>
            {data.map((item) => {
                return (
                    <li key={item.rank} className='p-4 border rounded'>
                        <div className="flex gap-2 items-center">
                        <Image className="rounded" src={item?.logoURI} width={32} height={32} alt={item?.name} />
                        <span>{item?.name}</span>
                        </div>
                        <div className="grids grid-cols-3">
                            <div className="col-span">
                                <span>Price:</span>
                                <span>${item.price}</span>
                            </div>
                            <div className="col-span">
                                <span>Price 24h change:</span>
                                <span className={cn({'text-green': item?.price24hChangePercent && item.price24hChangePercent > 0, 'text-red': item?.price24hChangePercent && item.price24hChangePercent < 0})}>${item?.price24hChangePercent}</span>
                            </div>
                            <div className="col-span">
                                <span>Liquidity:</span>
                                <span>${item.liquidity}</span>
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default TrendingToken