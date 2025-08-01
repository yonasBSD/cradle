import { useEffect, useRef, useState } from 'react';

const ResizableSplitPane = ({
    leftContent,
    rightContent,
    leftClassName = '',
    rightClassName = '',
    orientation = 'horizontal',
    initialSplitPosition = 50,
    minSplitPercentage = 20,
    maxSplitPercentage = 80,
    className = '',
    showRightPane = true,
    showLeftPane = true, // New prop to control left pane visibility
    onSplitChange,
}) => {
    const containerRef = useRef(null);
    const resizeRef = useRef(null);
    const [isResizing, setIsResizing] = useState(false);
    const [splitPosition, setSplitPosition] = useState(initialSplitPosition);
    const [lastPosition, setLastPosition] = useState(initialSplitPosition);

    const isVertical = orientation === 'vertical';

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            e.preventDefault();

            const container = containerRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            let newPosition = isVertical
                ? ((e.clientY - containerRect.top) / containerRect.height) * 100
                : ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Clamp the value when dragging (collapse via drag is not allowed)
            newPosition = Math.min(
                Math.max(newPosition, minSplitPercentage),
                maxSplitPercentage,
            );

            requestAnimationFrame(() => {
                setSplitPosition(newPosition);
                onSplitChange?.(newPosition);
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.classList.remove('select-none');
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.classList.add('select-none');
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, isVertical, maxSplitPercentage, minSplitPercentage, onSplitChange]);

    useEffect(() => {
        if (showRightPane) {
            setSplitPosition(lastPosition);
        } else {
            setLastPosition(splitPosition);
            setSplitPosition(100);
        }
    }, [showRightPane, lastPosition]);

    useEffect(() => {
        if (showLeftPane) {
            setSplitPosition(lastPosition);
        } else {
            setLastPosition(splitPosition);
            setSplitPosition(0);
        }
    }, [showLeftPane, lastPosition]);

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden w-full h-full relative flex ${isVertical ? 'flex-col' : 'flex-row'} ${className}`}
        >
            {showLeftPane && (
                <div
                    className={`rounded-md transition-[width,height] duration-200 ease-out ${leftClassName}`}
                    style={{
                        width: !isVertical ? `${splitPosition}%` : '100%',
                        height: isVertical ? `${splitPosition}%` : '100%',
                    }}
                >
                    {leftContent}
                </div>
            )}

            {showLeftPane && showRightPane && (
                <div
                    ref={resizeRef}
                    className={`
                      ${isVertical ? 'h-1.5 w-full' : 'w-1.5 h-full'}
                      bg-gray-3 hover:bg-gray-4 active:bg-gray-5
                      transition-colors duration-200
                      ${isResizing ? 'bg-gray-5' : ''}
                      ${isVertical ? 'cursor-row-resize' : 'cursor-col-resize'}
                      relative group
                    `}
                    onMouseDown={() => setIsResizing(true)}
                    onDoubleClick={() => {
                        if (splitPosition !== 0) {
                            // Collapse left side
                            setLastPosition(splitPosition);
                            setSplitPosition(0);
                            onSplitChange?.(0);
                        } else {
                            // Expand left side
                            const newPos =
                                lastPosition > 0 ? lastPosition : initialSplitPosition;
                            setSplitPosition(newPos);
                            onSplitChange?.(newPos);
                        }
                    }}
                >
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div
                            className={`
                            w-1 h-6 bg-gray-6 rounded-full opacity-0
                            group-hover:opacity-100 transition-opacity duration-200 z-0
                            ${isVertical ? 'rotate-90' : ''}
                          `}
                        />
                    </div>
                </div>
            )}

            {showRightPane && (
                <div
                    className={`rounded-md transition-[width,height] duration-200 ease-out ${rightClassName}`}
                    style={{
                        width: !isVertical
                            ? showLeftPane
                                ? `${100 - splitPosition}%`
                                : '100%'
                            : '100%',
                        height: isVertical
                            ? showLeftPane
                                ? `${100 - splitPosition}%`
                                : '100%'
                            : '100%',
                    }}
                >
                    {rightContent}
                </div>
            )}
        </div>
    );
};

export default ResizableSplitPane;
