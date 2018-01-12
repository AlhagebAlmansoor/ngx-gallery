import { EventEmitter, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { NgxGalleryHelperService } from './ngx-gallery-helper.service';
import { NgxGalleryOrderedImage } from './ngx-gallery-ordered-image.model';
export declare class NgxGalleryImageComponent implements OnInit, OnChanges {
    private sanitization;
    private elementRef;
    private helperService;
    images: NgxGalleryOrderedImage[];
    clickable: boolean;
    selectedIndex: number;
    arrows: boolean;
    arrowsAutoHide: boolean;
    swipe: boolean;
    animation: string;
    size: string;
    arrowPrevIcon: string;
    arrowNextIcon: string;
    autoPlay: boolean;
    autoPlayInterval: number;
    autoPlayPauseOnHover: boolean;
    infinityMove: boolean;
    lazyLoading: boolean;
    onClick: EventEmitter<{}>;
    onActiveChange: EventEmitter<{}>;
    canChangeImage: boolean;
    private timer;
    constructor(sanitization: DomSanitizer, elementRef: ElementRef, helperService: NgxGalleryHelperService);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
    reset(index: number): void;
    getImages(): NgxGalleryOrderedImage[];
    startAutoPlay(): void;
    stopAutoPlay(): void;
    handleClick(event: Event, index: number): void;
    showNext(): boolean;
    showPrev(): void;
    setChangeTimeout(): void;
    canShowNext(): boolean;
    canShowPrev(): boolean;
    getSafeUrl(image: string): SafeStyle;
}
