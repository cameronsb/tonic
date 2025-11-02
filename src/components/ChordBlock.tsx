import React, { useState, useRef, useEffect } from 'react';
import { useGrid } from '../hooks/useGrid';
import type { ChordBlock as ChordBlockType } from '../types/music';
import './ChordBlock.css';

 
interface ChordBlockProps {
    block: ChordBlockType;
    blockIndex: number;
    isPlaying: boolean;
    onResize: (id: string, newDuration: number) => void;
    onDelete: (id: string) => void;
    onPlay: (block: ChordBlockType) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
    onMove: (id: string, newPosition: number) => void;
}
 

export function ChordBlock({
    block,
    blockIndex,
    isPlaying,
    onResize,
    onDelete,
    onPlay,
    onReorder,
    onMove,
}: ChordBlockProps) {
    const grid = useGrid();
    const [isDraggingToMove, setIsDraggingToMove] = useState(false);
    const [isDraggingToReorder, setIsDraggingToReorder] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartX = useRef(0);
    const dragStartPosition = useRef(0);
    const resizeStartX = useRef(0);
    const resizeStartDuration = useRef(0);
    const blockRef = useRef<HTMLDivElement>(null);

    const left = grid.timeToPixels(block.position);
    const width = grid.timeToPixels(block.duration);

    useEffect(() => {
        if (!isResizing && !isDraggingToMove) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing) {
                const deltaX = e.clientX - resizeStartX.current;
                const newDurationPx = grid.timeToPixels(resizeStartDuration.current) + deltaX;
                const snappedPx = grid.snapToGrid(Math.max(grid.config.pixelsPerEighth, newDurationPx));
                const newDuration = grid.pixelsToTime(snappedPx);
                onResize(block.id, Math.max(1, newDuration));
            } else if (isDraggingToMove) {
                const deltaX = e.clientX - dragStartX.current;
                const newPositionPx = grid.timeToPixels(dragStartPosition.current) + deltaX;
                const snappedPx = grid.snapToGrid(Math.max(0, newPositionPx));
                const newPosition = grid.pixelsToTime(snappedPx);
                onMove(block.id, newPosition);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            setIsDraggingToMove(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, isDraggingToMove, block.id, block.position, grid, onResize, onMove]);

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        resizeStartX.current = e.clientX;
        resizeStartDuration.current = block.duration;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
        if ((e.target as HTMLElement).classList.contains('delete-btn')) return;

        e.preventDefault();

        if (e.shiftKey) {
            setIsDraggingToReorder(true);
        } else {
            setIsDraggingToMove(true);
            dragStartX.current = e.clientX;
            dragStartPosition.current = block.position;
        }
    };

    const handleClick = () => {
        if (!isDraggingToMove && !isDraggingToReorder) {
            onPlay(block);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(block.id);
    };

    const handleDragStart = (e: React.DragEvent) => {
        if (!isDraggingToReorder) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', blockIndex.toString());
    };

    const handleDragEnd = () => {
        setIsDraggingToReorder(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (fromIndex !== blockIndex) {
            onReorder(fromIndex, blockIndex);
        }
    };

    return (
        <div
            ref={blockRef}
            draggable={isDraggingToReorder && !isResizing}
            className={`chord-block-positioned ${isPlaying ? 'playing' : ''} ${isDraggingToMove ? 'dragging-move' : ''} ${isDraggingToReorder ? 'dragging-reorder' : ''} ${isResizing ? 'resizing' : ''}`}
            style={{
                left: `${left}px`,
                width: `${width}px`,
            }}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            title="Drag to move, Shift+Drag to reorder, click to play"
        >
            <div className="chord-block-content-inner">
                <span className="chord-numeral">{block.numeral}</span>
                <span className="chord-root">{block.rootNote}</span>
            </div>
            <button
                className="delete-btn"
                onClick={handleDeleteClick}
                title="Delete"
            >
                ×
            </button>
            <div
                className="resize-handle"
                onMouseDown={handleResizeMouseDown}
                title="Drag to resize"
            />
        </div>
    );
}

