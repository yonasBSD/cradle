import React, { useState, useEffect } from "react";
import { Xmark } from "iconoir-react";

/**
 * AlertDismissible component - This component is used to display an alert that can be dismissed.
 * The component has an absolute position at the bottom right of the screen.
 * @param alert
 * @param setAlert
 * @param content
 * @param color - The background color of the alert. Use colorVariants to define classes for different colors.
 * @param duration - The duration in milliseconds for which the alert should be displayed.
 * @returns {AlertDismissible}
 * @constructor
 */
export default function AlertDismissible({ alert, setAlert, color = "red", duration = 3500.0 }) {
    const colorVariants = {
        green: 'bg-success',
        red: 'bg-error',
        gray: 'bg-zinc-600',
    };

    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (alert) {
            setTimeLeft(duration);
            const timer = setTimeout(() => {
                setAlert("");
            }, duration);

            const updateInterval = 1000.0 / 120;
            const interval = setInterval(() => {
                setTimeLeft((prevTimeLeft) => prevTimeLeft - updateInterval);
            }, updateInterval);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        }
    }, [alert, setAlert, duration]);

    return (
        <>
            {alert && (
                <div className={`${colorVariants[color]} fixed z-50 bottom-2 right-6 text-white h-fit py-6 w-fit
                 rounded-md shadow-lg flex flex-col items-center space-y-4 break-all max-w-[40%] max-h-full`} data-testid='dismissable-alert'>
                    <div className="flex flex-row items-center justify-between px-4">
                        <p>{alert}</p>
                        <button
                            className={`${colorVariants[color]} hover:opacity-90 text-white font-bold py-2 pl-4`}
                            onClick={() => setAlert("")}
                        >
                            <Xmark color="gray-12" strokeWidth="2" />
                        </button>
                    </div>
                    <div className={`${colorVariants[color]} w-full rounded-md absolute bottom-0 px-2`}>
                        <progress
                            value={timeLeft}
                            max={duration}
                            className="h-[0.3em] progress progress-flat-secondary w-full !rounded-md opacity-75"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
