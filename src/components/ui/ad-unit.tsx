import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AdUnitProps {
    format?: 'horizontal' | 'vertical' | 'rectangle';
    slotId?: string;
    className?: string;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const AdUnit: React.FC<AdUnitProps> = ({
    format = 'horizontal',
    slotId = 'mock-slot-id',
    className
}) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    // Dimensions based on standard ad sizes
    const getDimensions = () => {
        switch (format) {
            case 'horizontal':
                return 'w-full h-[90px]'; // Leaderboard 728x90
            case 'vertical':
                return 'w-[160px] h-[600px]'; // Skyscraper 160x600
            case 'rectangle':
                return 'w-[300px] h-[250px]'; // Medium Rectangle 300x250
            default:
                return 'w-full h-[90px]';
        }
    };

    return (
        <div className={cn("flex justify-center items-center my-4", className)}>
            <div className={cn(
                "bg-gray-50 flex flex-col items-center justify-center overflow-hidden relative",
                getDimensions()
            )}>
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                    data-ad-client="ca-pub-7617335803389664"
                    data-ad-slot={slotId}
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>
            </div>
        </div>
    );
};
