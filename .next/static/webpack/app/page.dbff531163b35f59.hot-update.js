"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./components/ProjectCarousel.tsx":
/*!****************************************!*\
  !*** ./components/ProjectCarousel.tsx ***!
  \****************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ProjectCarousel: function() { return /* binding */ ProjectCarousel; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var swiper_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! swiper/react */ \"(app-pages-browser)/./node_modules/swiper/swiper-react.mjs\");\n/* harmony import */ var swiper_modules__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! swiper/modules */ \"(app-pages-browser)/./node_modules/swiper/modules/index.mjs\");\n/* harmony import */ var _barrel_optimize_names_X_lucide_react__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! __barrel_optimize__?names=X!=!lucide-react */ \"(app-pages-browser)/./node_modules/lucide-react/dist/esm/icons/x.js\");\n/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/image */ \"(app-pages-browser)/./node_modules/next/dist/api/image.js\");\n/* harmony import */ var react_device_frameset__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-device-frameset */ \"(app-pages-browser)/./node_modules/react-device-frameset/dist/index.mjs\");\n/* harmony import */ var _styles_device_frames_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/styles/device-frames.css */ \"(app-pages-browser)/./styles/device-frames.css\");\n/* harmony import */ var swiper_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! swiper/css */ \"(app-pages-browser)/./node_modules/swiper/swiper.css\");\n/* harmony import */ var swiper_css_navigation__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! swiper/css/navigation */ \"(app-pages-browser)/./node_modules/swiper/modules/navigation.css\");\n/* harmony import */ var swiper_css_pagination__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! swiper/css/pagination */ \"(app-pages-browser)/./node_modules/swiper/modules/pagination.css\");\n/* harmony import */ var swiper_css_effect_coverflow__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! swiper/css/effect-coverflow */ \"(app-pages-browser)/./node_modules/swiper/modules/effect-coverflow.css\");\n/* __next_internal_client_entry_do_not_use__ ProjectCarousel auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n\n\n\n\n\n\n\nfunction ProjectCarousel(param) {\n    let { images, onClose, projectType } = param;\n    _s();\n    const swiperRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"relative w-full max-w-6xl h-[85vh] flex flex-col bg-[#F5F1EA] rounded-2xl p-4 md:p-8\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                    onClick: onClose,\n                    className: \"absolute top-4 right-4 z-50 text-neutral-800 hover:text-neutral-600 transition-colors\",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_X_lucide_react__WEBPACK_IMPORTED_MODULE_10__[\"default\"], {\n                            className: \"h-6 w-6\"\n                        }, void 0, false, {\n                            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                            lineNumber: 31,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                            className: \"sr-only\",\n                            children: \"Close\"\n                        }, void 0, false, {\n                            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                            lineNumber: 32,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                    lineNumber: 27,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(swiper_react__WEBPACK_IMPORTED_MODULE_2__.Swiper, {\n                    ref: swiperRef,\n                    modules: [\n                        swiper_modules__WEBPACK_IMPORTED_MODULE_3__.Navigation,\n                        swiper_modules__WEBPACK_IMPORTED_MODULE_3__.Pagination,\n                        swiper_modules__WEBPACK_IMPORTED_MODULE_3__.EffectCoverflow\n                    ],\n                    navigation: true,\n                    pagination: {\n                        clickable: true\n                    },\n                    effect: \"coverflow\",\n                    coverflowEffect: {\n                        rotate: 35,\n                        stretch: 0,\n                        depth: 50,\n                        modifier: 1.5,\n                        slideShadows: true\n                    },\n                    centeredSlides: true,\n                    slidesPerView: 1,\n                    loop: true,\n                    breakpoints: {\n                        768: {\n                            slidesPerView: 1.5\n                        },\n                        1024: {\n                            slidesPerView: 1.8\n                        },\n                        1280: {\n                            slidesPerView: 2\n                        }\n                    },\n                    className: \"w-full h-full\",\n                    children: images.map((src, idx)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(swiper_react__WEBPACK_IMPORTED_MODULE_2__.SwiperSlide, {\n                            className: \"flex items-center justify-center py-4 md:py-8\",\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"w-full h-full flex items-center justify-center\",\n                                children: projectType === \"mobile\" ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                    className: \"transform scale-[0.65] md:scale-[0.85] origin-center\",\n                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_device_frameset__WEBPACK_IMPORTED_MODULE_11__.DeviceFrameset, {\n                                        device: \"iPhone X\",\n                                        color: \"black\",\n                                        landscape: false,\n                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_image__WEBPACK_IMPORTED_MODULE_4__[\"default\"], {\n                                            src: src,\n                                            alt: \"Project image \".concat(idx + 1),\n                                            fill: true,\n                                            className: \"object-cover\",\n                                            priority: idx === 0\n                                        }, void 0, false, {\n                                            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                            lineNumber: 70,\n                                            columnNumber: 23\n                                        }, this)\n                                    }, void 0, false, {\n                                        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                        lineNumber: 69,\n                                        columnNumber: 21\n                                    }, this)\n                                }, void 0, false, {\n                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                    lineNumber: 68,\n                                    columnNumber: 19\n                                }, this) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                    className: \"transform scale-[0.35] md:scale-[0.6] origin-center\",\n                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_device_frameset__WEBPACK_IMPORTED_MODULE_11__.DeviceFrameset, {\n                                        device: \"MacBook Pro\",\n                                        color: \"silver\",\n                                        children: [\n                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                className: \"relative w-[1280px] h-[800px] bg-black\",\n                                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                    className: \"absolute inset-0 flex items-center justify-center\",\n                                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_image__WEBPACK_IMPORTED_MODULE_4__[\"default\"], {\n                                                        src: src,\n                                                        alt: \"Project image \".concat(idx + 1),\n                                                        fill: true,\n                                                        className: \"object-contain\",\n                                                        style: {\n                                                            padding: \"2px\"\n                                                        },\n                                                        priority: idx === 0\n                                                    }, void 0, false, {\n                                                        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                                        lineNumber: 84,\n                                                        columnNumber: 27\n                                                    }, this)\n                                                }, void 0, false, {\n                                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                                    lineNumber: 83,\n                                                    columnNumber: 25\n                                                }, this)\n                                            }, void 0, false, {\n                                                fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                                lineNumber: 82,\n                                                columnNumber: 23\n                                            }, this),\n                                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                className: \"bottom-bar\"\n                                            }, void 0, false, {\n                                                fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                                lineNumber: 94,\n                                                columnNumber: 23\n                                            }, this)\n                                        ]\n                                    }, void 0, true, {\n                                        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                        lineNumber: 81,\n                                        columnNumber: 21\n                                    }, this)\n                                }, void 0, false, {\n                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                    lineNumber: 80,\n                                    columnNumber: 19\n                                }, this)\n                            }, void 0, false, {\n                                fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                                lineNumber: 66,\n                                columnNumber: 15\n                            }, this)\n                        }, idx, false, {\n                            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                            lineNumber: 65,\n                            columnNumber: 13\n                        }, this))\n                }, void 0, false, {\n                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n                    lineNumber: 35,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n            lineNumber: 26,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/ProjectCarousel.tsx\",\n        lineNumber: 25,\n        columnNumber: 5\n    }, this);\n}\n_s(ProjectCarousel, \"7rRnQCzUMwK497nz2pZRyPKpHOg=\");\n_c = ProjectCarousel;\nvar _c;\n$RefreshReg$(_c, \"ProjectCarousel\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2NvbXBvbmVudHMvUHJvamVjdENhcm91c2VsLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRStCO0FBQ29CO0FBQ3NCO0FBQ3hDO0FBQ0Y7QUFDd0I7QUFDbkI7QUFDaEI7QUFDVztBQUNBO0FBQ007QUFROUIsU0FBU1MsZ0JBQWdCLEtBQXNEO1FBQXRELEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFFQyxXQUFXLEVBQXdCLEdBQXREOztJQUM5QixNQUFNQyxZQUFZYiw2Q0FBTUEsQ0FBQztJQUV6QixxQkFDRSw4REFBQ2M7UUFBSUMsV0FBVTtrQkFDYiw0RUFBQ0Q7WUFBSUMsV0FBVTs7OEJBQ2IsOERBQUNDO29CQUNDQyxTQUFTTjtvQkFDVEksV0FBVTs7c0NBRVYsOERBQUNULDhFQUFDQTs0QkFBQ1MsV0FBVTs7Ozs7O3NDQUNiLDhEQUFDRzs0QkFBS0gsV0FBVTtzQ0FBVTs7Ozs7Ozs7Ozs7OzhCQUc1Qiw4REFBQ2QsZ0RBQU1BO29CQUNMa0IsS0FBS047b0JBQ0xPLFNBQVM7d0JBQUNqQixzREFBVUE7d0JBQUVDLHNEQUFVQTt3QkFBRUMsMkRBQWVBO3FCQUFDO29CQUNsRGdCLFVBQVU7b0JBQ1ZDLFlBQVk7d0JBQUVDLFdBQVc7b0JBQUs7b0JBQzlCQyxRQUFPO29CQUNQQyxpQkFBaUI7d0JBQ2ZDLFFBQVE7d0JBQ1JDLFNBQVM7d0JBQ1RDLE9BQU87d0JBQ1BDLFVBQVU7d0JBQ1ZDLGNBQWM7b0JBQ2hCO29CQUNBQyxjQUFjO29CQUNkQyxlQUFlO29CQUNmQyxJQUFJO29CQUNKQyxhQUFhO3dCQUNYLEtBQUs7NEJBQ0hGLGVBQWU7d0JBQ2pCO3dCQUNBLE1BQU07NEJBQ0pBLGVBQWU7d0JBQ2pCO3dCQUNBLE1BQU07NEJBQ0pBLGVBQWU7d0JBQ2pCO29CQUNGO29CQUNBakIsV0FBVTs4QkFFVEwsT0FBT3lCLEdBQUcsQ0FBQyxDQUFDQyxLQUFLQyxvQkFDaEIsOERBQUNuQyxxREFBV0E7NEJBQVdhLFdBQVU7c0NBQy9CLDRFQUFDRDtnQ0FBSUMsV0FBVTswQ0FDWkgsZ0JBQWdCLHlCQUNmLDhEQUFDRTtvQ0FBSUMsV0FBVTs4Q0FDYiw0RUFBQ1Asa0VBQWNBO3dDQUFDOEIsUUFBTzt3Q0FBV0MsT0FBTTt3Q0FBUUMsV0FBVztrREFDekQsNEVBQUNqQyxrREFBS0E7NENBQ0o2QixLQUFLQTs0Q0FDTEssS0FBSyxpQkFBeUIsT0FBUkosTUFBTTs0Q0FDNUJLLElBQUk7NENBQ0ozQixXQUFVOzRDQUNWNEIsVUFBVU4sUUFBUTs7Ozs7Ozs7Ozs7Ozs7O3lEQUt4Qiw4REFBQ3ZCO29DQUFJQyxXQUFVOzhDQUNiLDRFQUFDUCxrRUFBY0E7d0NBQUM4QixRQUFPO3dDQUFjQyxPQUFNOzswREFDekMsOERBQUN6QjtnREFBSUMsV0FBVTswREFDYiw0RUFBQ0Q7b0RBQUlDLFdBQVU7OERBQ2IsNEVBQUNSLGtEQUFLQTt3REFDSjZCLEtBQUtBO3dEQUNMSyxLQUFLLGlCQUF5QixPQUFSSixNQUFNO3dEQUM1QkssSUFBSTt3REFDSjNCLFdBQVU7d0RBQ1Y2QixPQUFPOzREQUFFQyxTQUFTO3dEQUFNO3dEQUN4QkYsVUFBVU4sUUFBUTs7Ozs7Ozs7Ozs7Ozs7OzswREFJeEIsOERBQUN2QjtnREFBSUMsV0FBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQkE3QlBzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0M5QjtHQXBGZ0I1QjtLQUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9jb21wb25lbnRzL1Byb2plY3RDYXJvdXNlbC50c3g/OTZjNiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCc7XG5cbmltcG9ydCB7IHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFN3aXBlciwgU3dpcGVyU2xpZGUgfSBmcm9tICdzd2lwZXIvcmVhY3QnO1xuaW1wb3J0IHsgTmF2aWdhdGlvbiwgUGFnaW5hdGlvbiwgRWZmZWN0Q292ZXJmbG93IH0gZnJvbSAnc3dpcGVyL21vZHVsZXMnO1xuaW1wb3J0IHsgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgSW1hZ2UgZnJvbSAnbmV4dC9pbWFnZSc7XG5pbXBvcnQgeyBEZXZpY2VGcmFtZXNldCB9IGZyb20gJ3JlYWN0LWRldmljZS1mcmFtZXNldCc7XG5pbXBvcnQgJ0Avc3R5bGVzL2RldmljZS1mcmFtZXMuY3NzJztcbmltcG9ydCAnc3dpcGVyL2Nzcyc7XG5pbXBvcnQgJ3N3aXBlci9jc3MvbmF2aWdhdGlvbic7XG5pbXBvcnQgJ3N3aXBlci9jc3MvcGFnaW5hdGlvbic7XG5pbXBvcnQgJ3N3aXBlci9jc3MvZWZmZWN0LWNvdmVyZmxvdyc7XG5cbmludGVyZmFjZSBQcm9qZWN0Q2Fyb3VzZWxQcm9wcyB7XG4gIGltYWdlczogc3RyaW5nW107XG4gIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG4gIHByb2plY3RUeXBlPzogJ2Rlc2t0b3AnIHwgJ21vYmlsZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQcm9qZWN0Q2Fyb3VzZWwoeyBpbWFnZXMsIG9uQ2xvc2UsIHByb2plY3RUeXBlIH06IFByb2plY3RDYXJvdXNlbFByb3BzKSB7XG4gIGNvbnN0IHN3aXBlclJlZiA9IHVzZVJlZihudWxsKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCB6LTUwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGJnLWJsYWNrIGJnLW9wYWNpdHktNzBcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgdy1mdWxsIG1heC13LTZ4bCBoLVs4NXZoXSBmbGV4IGZsZXgtY29sIGJnLVsjRjVGMUVBXSByb3VuZGVkLTJ4bCBwLTQgbWQ6cC04XCI+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrPXtvbkNsb3NlfVxuICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IHJpZ2h0LTQgei01MCB0ZXh0LW5ldXRyYWwtODAwIGhvdmVyOnRleHQtbmV1dHJhbC02MDAgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICA+XG4gICAgICAgICAgPFggY2xhc3NOYW1lPVwiaC02IHctNlwiIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic3Itb25seVwiPkNsb3NlPC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICA8U3dpcGVyXG4gICAgICAgICAgcmVmPXtzd2lwZXJSZWZ9XG4gICAgICAgICAgbW9kdWxlcz17W05hdmlnYXRpb24sIFBhZ2luYXRpb24sIEVmZmVjdENvdmVyZmxvd119XG4gICAgICAgICAgbmF2aWdhdGlvblxuICAgICAgICAgIHBhZ2luYXRpb249e3sgY2xpY2thYmxlOiB0cnVlIH19XG4gICAgICAgICAgZWZmZWN0PVwiY292ZXJmbG93XCJcbiAgICAgICAgICBjb3ZlcmZsb3dFZmZlY3Q9e3tcbiAgICAgICAgICAgIHJvdGF0ZTogMzUsXG4gICAgICAgICAgICBzdHJldGNoOiAwLFxuICAgICAgICAgICAgZGVwdGg6IDUwLFxuICAgICAgICAgICAgbW9kaWZpZXI6IDEuNSxcbiAgICAgICAgICAgIHNsaWRlU2hhZG93czogdHJ1ZSxcbiAgICAgICAgICB9fVxuICAgICAgICAgIGNlbnRlcmVkU2xpZGVzXG4gICAgICAgICAgc2xpZGVzUGVyVmlldz17MX1cbiAgICAgICAgICBsb29wXG4gICAgICAgICAgYnJlYWtwb2ludHM9e3tcbiAgICAgICAgICAgIDc2ODoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLjUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTAyNDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLjgsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTI4MDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIlxuICAgICAgICA+XG4gICAgICAgICAge2ltYWdlcy5tYXAoKHNyYywgaWR4KSA9PiAoXG4gICAgICAgICAgICA8U3dpcGVyU2xpZGUga2V5PXtpZHh9IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB5LTQgbWQ6cHktOFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICB7cHJvamVjdFR5cGUgPT09ICdtb2JpbGUnID8gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0cmFuc2Zvcm0gc2NhbGUtWzAuNjVdIG1kOnNjYWxlLVswLjg1XSBvcmlnaW4tY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxEZXZpY2VGcmFtZXNldCBkZXZpY2U9XCJpUGhvbmUgWFwiIGNvbG9yPVwiYmxhY2tcIiBsYW5kc2NhcGU9e2ZhbHNlfT5cbiAgICAgICAgICAgICAgICAgICAgICA8SW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17c3JjfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtgUHJvamVjdCBpbWFnZSAke2lkeCArIDF9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm9iamVjdC1jb3ZlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eT17aWR4ID09PSAwfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvRGV2aWNlRnJhbWVzZXQ+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0cmFuc2Zvcm0gc2NhbGUtWzAuMzVdIG1kOnNjYWxlLVswLjZdIG9yaWdpbi1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPERldmljZUZyYW1lc2V0IGRldmljZT1cIk1hY0Jvb2sgUHJvXCIgY29sb3I9XCJzaWx2ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIHctWzEyODBweF0gaC1bODAwcHhdIGJnLWJsYWNrXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtzcmN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtgUHJvamVjdCBpbWFnZSAke2lkeCArIDF9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwib2JqZWN0LWNvbnRhaW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6ICcycHgnIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk9e2lkeCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYm90dG9tLWJhclwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvRGV2aWNlRnJhbWVzZXQ+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvU3dpcGVyU2xpZGU+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvU3dpcGVyPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59ICJdLCJuYW1lcyI6WyJ1c2VSZWYiLCJTd2lwZXIiLCJTd2lwZXJTbGlkZSIsIk5hdmlnYXRpb24iLCJQYWdpbmF0aW9uIiwiRWZmZWN0Q292ZXJmbG93IiwiWCIsIkltYWdlIiwiRGV2aWNlRnJhbWVzZXQiLCJQcm9qZWN0Q2Fyb3VzZWwiLCJpbWFnZXMiLCJvbkNsb3NlIiwicHJvamVjdFR5cGUiLCJzd2lwZXJSZWYiLCJkaXYiLCJjbGFzc05hbWUiLCJidXR0b24iLCJvbkNsaWNrIiwic3BhbiIsInJlZiIsIm1vZHVsZXMiLCJuYXZpZ2F0aW9uIiwicGFnaW5hdGlvbiIsImNsaWNrYWJsZSIsImVmZmVjdCIsImNvdmVyZmxvd0VmZmVjdCIsInJvdGF0ZSIsInN0cmV0Y2giLCJkZXB0aCIsIm1vZGlmaWVyIiwic2xpZGVTaGFkb3dzIiwiY2VudGVyZWRTbGlkZXMiLCJzbGlkZXNQZXJWaWV3IiwibG9vcCIsImJyZWFrcG9pbnRzIiwibWFwIiwic3JjIiwiaWR4IiwiZGV2aWNlIiwiY29sb3IiLCJsYW5kc2NhcGUiLCJhbHQiLCJmaWxsIiwicHJpb3JpdHkiLCJzdHlsZSIsInBhZGRpbmciXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./components/ProjectCarousel.tsx\n"));

/***/ })

});