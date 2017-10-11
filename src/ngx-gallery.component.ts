import { Component, Input, HostListener, ViewChild, OnInit,
    HostBinding, DoCheck, ElementRef, AfterViewInit, Output, EventEmitter, Inject } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { NgxGalleryPreviewComponent } from './ngx-gallery-preview.component';
import { NgxGalleryImageComponent } from './ngx-gallery-image.component';
import { NgxGalleryHelperService } from './ngx-gallery-helper.service';

import { NgxGalleryOptions } from './ngx-gallery-options.model';
import { NgxGalleryImage } from './ngx-gallery-image.model';
import { NgxGalleryLayout } from './ngx-gallery-layout.model';

@Component({
    selector: 'ngx-gallery',
    templateUrl: './ngx-gallery.component.html',
    styleUrls: ['./ngx-gallery.component.scss'],
    providers: [NgxGalleryHelperService]
})
export class NgxGalleryComponent implements OnInit, DoCheck, AfterViewInit   {
    @Input() options: NgxGalleryOptions[];
    @Input() images: NgxGalleryImage[];

    @Output() change = new EventEmitter();
    @Output() previewOpen = new EventEmitter();
    @Output() previewClose = new EventEmitter();

    smallImages: string[] | SafeResourceUrl[];
    mediumImages: string[] | SafeResourceUrl;
    bigImages: string[] | SafeResourceUrl[];
    descriptions: string[];

    oldImages: NgxGalleryImage[];
    oldImagesLength = 0;

    selectedIndex = 0;
    previewEnabled: boolean;

    currentOptions: NgxGalleryOptions;

    private breakpoint: number | undefined = undefined;
    private prevBreakpoint: number | undefined = undefined;
    private fullWidthTimeout: any;

    @ViewChild(NgxGalleryPreviewComponent) preview: NgxGalleryPreviewComponent;
    @ViewChild(NgxGalleryImageComponent) image: NgxGalleryImageComponent;

    @HostBinding('style.width') width: string;
    @HostBinding('style.height') height: string;
    @HostBinding('style.left') left: string;

    constructor(private myElement: ElementRef,
        @Inject(PLATFORM_ID) private platformId: Object) {}

    ngOnInit() {
        this.options = this.options.map((opt) => new NgxGalleryOptions(opt));
        this.sortOptions();
        this.setBreakpoint();
        this.setOptions();
        this.checkFullWidth();
        if (this.currentOptions) {
            this.selectedIndex = <number>this.currentOptions.startIndex;
        }
    }

    ngDoCheck(): void {
        if (this.images !== undefined && (this.images.length !== this.oldImagesLength)
            || (this.images !== this.oldImages)) {
            this.oldImagesLength = this.images.length;
            this.oldImages = this.images;
            this.setImages();
        }
    }

    ngAfterViewInit(): void {
        this.checkFullWidth();
    }

    @HostListener('window:resize') onResize() {
        this.setBreakpoint();

        if (this.prevBreakpoint !== this.breakpoint) {
            this.setOptions();
        }

        if (this.currentOptions && this.currentOptions.fullWidth) {

            if (this.fullWidthTimeout) {
                clearTimeout(this.fullWidthTimeout);
            }

            this.fullWidthTimeout = setTimeout(() => {
                this.checkFullWidth();
            }, 200);
        }
    }

    getImageHeight(): string {
        return (this.currentOptions && this.currentOptions.thumbnails) ?
            this.currentOptions.imagePercent + '%' : '100%';
    }

    getThumbnailsHeight(): string {
        if (this.currentOptions && this.currentOptions.image) {
            return 'calc(' + this.currentOptions.thumbnailsPercent + '% - '
            + this.currentOptions.thumbnailsMargin + 'px)';
        } else {
            return '100%';
        }
    }

    getThumbnailsMarginTop(): string {
        if (this.currentOptions && this.currentOptions.layout === NgxGalleryLayout.ThumbnailsBottom) {
            return this.currentOptions.thumbnailsMargin + 'px';
        } else {
            return '0px';
        }
    }

    getThumbnailsMarginBottom(): string {
        if (this.currentOptions && this.currentOptions.layout === NgxGalleryLayout.ThumbnailsTop) {
            return this.currentOptions.thumbnailsMargin + 'px';
        } else {
            return '0px';
        }
    }

    openPreview(index: number): void {
        this.previewEnabled = true;
        this.preview.open(index);
    }

    onPreviewOpen(): void {
        this.previewOpen.emit();
    }

    onPreviewClose(): void {
        this.previewEnabled = false;
        this.previewClose.emit();
    }

    select(index: number) {
        this.selectedIndex = index;

        this.change.emit({
            index,
            image: this.images[index]
        });

        if (this.currentOptions && !this.currentOptions.image && this.currentOptions.thumbnails && this.currentOptions.preview) {
            this.openPreview(this.selectedIndex);
        }
    }

    showNext(): void {
        this.image.showNext();
    }

    showPrev(): void {
        this.image.showPrev();
    }

    canShowNext(): boolean {
        if (this.images && this.currentOptions) {
            return (this.currentOptions.imageInfinityMove || this.selectedIndex < this.images.length - 1)
                ? true : false;
        } else {
            return false;
        }
    }

    canShowPrev(): boolean {
        if (this.images && this.currentOptions) {
            return (this.currentOptions.imageInfinityMove || this.selectedIndex > 0) ? true : false;
        } else {
            return false;
        }
    }

    private checkFullWidth(): void {
        if (this.currentOptions && this.currentOptions.fullWidth) {
            this.width = document.body.clientWidth + 'px';
            this.left = (-(document.body.clientWidth -
                this.myElement.nativeElement.parentNode.innerWidth) / 2) + 'px';
        }
    }

    private setImages(): void {
        this.smallImages = this.images.map((img) => <string>img.small);
        this.mediumImages = this.images.map((img) => <string>img.medium);
        this.bigImages = this.images.map((img) => <string>img.big);
        this.descriptions = this.images.map((img) => <string>img.description);
    }

    private setBreakpoint(): void {
        this.prevBreakpoint = this.breakpoint;
        let breakpoints;

        if (isPlatformBrowser(this.platformId)) {
            breakpoints = this.options.filter((opt) => opt.breakpoint >= window.innerWidth)
                .map((opt) => opt.breakpoint);
        }

        if (breakpoints && breakpoints.length) {
            this.breakpoint = breakpoints.pop();
        } else {
            this.breakpoint = undefined;
        }
    }

    private sortOptions(): void {
        this.options = [
            ...this.options.filter((a) => a.breakpoint === undefined),
            ...this.options
                .filter((a) => a.breakpoint !== undefined)
                .sort((a, b) => b.breakpoint - a.breakpoint)
        ];
    }

    private setOptions(): void {
        this.currentOptions = new NgxGalleryOptions({});

        this.options
            .filter((opt) => opt.breakpoint === undefined || opt.breakpoint >= this.breakpoint)
            .map((opt) => this.combineOptions(this.currentOptions, opt));

        this.width = <string>this.currentOptions.width;
        this.height = <string>this.currentOptions.height;
    }

    private combineOptions(first: NgxGalleryOptions, second: NgxGalleryOptions) {
        Object.keys(second).map((val) => first[val] = second[val] !== undefined ? second[val] : first[val]);
    }
}