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

/***/ "(app-pages-browser)/./components/WorkSection.tsx":
/*!************************************!*\
  !*** ./components/WorkSection.tsx ***!
  \************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   WorkSection: function() { return /* binding */ WorkSection; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/image */ \"(app-pages-browser)/./node_modules/next/dist/api/image.js\");\n/* harmony import */ var _ProjectCarousel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ProjectCarousel */ \"(app-pages-browser)/./components/ProjectCarousel.tsx\");\n/* harmony import */ var react_device_frameset__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-device-frameset */ \"(app-pages-browser)/./node_modules/react-device-frameset/dist/index.mjs\");\n/* harmony import */ var _styles_device_frames_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/styles/device-frames.css */ \"(app-pages-browser)/./styles/device-frames.css\");\n/* __next_internal_client_entry_do_not_use__ WorkSection auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n\nconst mockProjects = [\n    {\n        id: \"project1\",\n        title: \"E-commerce Dashboard\",\n        description: \"A comprehensive dashboard for managing online stores, featuring real-time analytics, inventory management, and customer insights. Built with a focus on usability and performance.\",\n        type: \"desktop\",\n        image: \"/images/projects/project1-1.png\",\n        images: [\n            \"/images/projects/project1-1.png\"\n        ],\n        technologies: [\n            \"React\",\n            \"Next.js\",\n            \"TypeScript\",\n            \"Tailwind CSS\"\n        ]\n    },\n    {\n        id: \"simplefitness\",\n        title: \"Simple Fitness (Tracking App!)\",\n        description: \"A simple fitness tracking app for logging strength training and cardio workouts. Built natively on iOS, which makes this my actual go to app for tracking my workouts.\",\n        type: \"mobile\",\n        image: \"/images/projects/simplefitness-1.png\",\n        images: [\n            \"/images/projects/simplefitness-1.png\",\n            \"/images/projects/simplefitness-2.png\",\n            \"/images/projects/simplefitness-3.png\",\n            \"/images/projects/simplefitness-4.png\"\n        ],\n        technologies: [\n            \"Xcode\",\n            \"Swift\",\n            \"CoreData\"\n        ]\n    }\n];\nfunction WorkSection() {\n    _s();\n    const observerRefs = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)([]);\n    const [isCarouselOpen, setIsCarouselOpen] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [selectedProject, setSelectedProject] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const observers = mockProjects.map((_, index)=>{\n            return new IntersectionObserver((entries)=>{\n                entries.forEach((entry)=>{\n                    if (entry.isIntersecting) {\n                        entry.target.classList.add(\"opacity-100\", \"translate-y-0\");\n                        entry.target.classList.remove(\"opacity-0\", \"translate-y-10\");\n                    }\n                });\n            }, {\n                threshold: 0.1,\n                rootMargin: \"-50px\"\n            });\n        });\n        observerRefs.current.forEach((ref, index)=>{\n            if (ref) observers[index].observe(ref);\n        });\n        return ()=>{\n            observerRefs.current.forEach((ref, index)=>{\n                if (ref) observers[index].unobserve(ref);\n            });\n        };\n    }, []);\n    const handleImageClick = (project)=>{\n        setSelectedProject(project);\n        setIsCarouselOpen(true);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"section\", {\n        id: \"work\",\n        className: \"min-h-screen bg-[#F5F1EA] py-24\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"max-w-6xl mx-auto px-4 md:px-8\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                        className: \"text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-12\",\n                        children: \"Selected Work\"\n                    }, void 0, false, {\n                        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                        lineNumber: 87,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"space-y-32\",\n                        children: mockProjects.map((project, index)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                ref: (el)=>{\n                                    observerRefs.current[index] = el;\n                                },\n                                className: \"opacity-0 translate-y-10 transition-all duration-1000 ease-out\",\n                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                    className: \"grid \".concat(project.type === \"desktop\" ? \"grid-cols-1\" : \"md:grid-cols-2 gap-8 items-center\"),\n                                    children: [\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                            className: \"relative \".concat(project.type === \"desktop\" ? \"aspect-video w-full mb-8\" : \"h-[600px] mx-auto md:mx-0 flex items-center justify-center\"),\n                                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                onClick: ()=>handleImageClick(project),\n                                                className: \"relative cursor-pointer transition-transform hover:scale-[1.02] \".concat(project.type === \"desktop\" ? \"w-full h-full\" : \"flex items-center justify-center\"),\n                                                children: project.type === \"mobile\" ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                    className: \"transform scale-[0.85] origin-center\",\n                                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_device_frameset__WEBPACK_IMPORTED_MODULE_5__.DeviceFrameset, {\n                                                        device: \"iPhone X\",\n                                                        color: \"black\",\n                                                        landscape: false,\n                                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_image__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n                                                            src: project.image,\n                                                            alt: project.title,\n                                                            fill: true,\n                                                            className: \"object-cover\"\n                                                        }, void 0, false, {\n                                                            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                            lineNumber: 119,\n                                                            columnNumber: 27\n                                                        }, this)\n                                                    }, void 0, false, {\n                                                        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                        lineNumber: 118,\n                                                        columnNumber: 25\n                                                    }, this)\n                                                }, void 0, false, {\n                                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                    lineNumber: 117,\n                                                    columnNumber: 23\n                                                }, this) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                    className: \"relative w-full h-full rounded-lg overflow-hidden shadow-lg\",\n                                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_image__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n                                                        src: project.image,\n                                                        alt: project.title,\n                                                        fill: true,\n                                                        className: \"object-cover\"\n                                                    }, void 0, false, {\n                                                        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                        lineNumber: 129,\n                                                        columnNumber: 25\n                                                    }, this)\n                                                }, void 0, false, {\n                                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                    lineNumber: 128,\n                                                    columnNumber: 23\n                                                }, this)\n                                            }, void 0, false, {\n                                                fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                lineNumber: 110,\n                                                columnNumber: 19\n                                            }, this)\n                                        }, void 0, false, {\n                                            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                            lineNumber: 103,\n                                            columnNumber: 17\n                                        }, this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                            className: \"\".concat(project.type === \"mobile\" ? \"md:order-first\" : \"\"),\n                                            children: [\n                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h3\", {\n                                                    className: \"text-2xl font-bold text-[#2C2C2C] mb-4\",\n                                                    children: project.title\n                                                }, void 0, false, {\n                                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                    lineNumber: 141,\n                                                    columnNumber: 19\n                                                }, this),\n                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                                                    className: \"text-[#4A4A4A] mb-6\",\n                                                    children: project.description\n                                                }, void 0, false, {\n                                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                    lineNumber: 144,\n                                                    columnNumber: 19\n                                                }, this),\n                                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                                    className: \"flex flex-wrap gap-2\",\n                                                    children: project.technologies.map((tech)=>/*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                                            className: \"px-3 py-1 bg-[#E8E2D7] text-[#2C2C2C] rounded-full text-sm\",\n                                                            children: tech\n                                                        }, tech, false, {\n                                                            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                            lineNumber: 149,\n                                                            columnNumber: 23\n                                                        }, this))\n                                                }, void 0, false, {\n                                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                                    lineNumber: 147,\n                                                    columnNumber: 19\n                                                }, this)\n                                            ]\n                                        }, void 0, true, {\n                                            fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                            lineNumber: 140,\n                                            columnNumber: 17\n                                        }, this)\n                                    ]\n                                }, void 0, true, {\n                                    fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                    lineNumber: 98,\n                                    columnNumber: 15\n                                }, this)\n                            }, project.id, false, {\n                                fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                                lineNumber: 91,\n                                columnNumber: 13\n                            }, this))\n                    }, void 0, false, {\n                        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                        lineNumber: 89,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                lineNumber: 86,\n                columnNumber: 7\n            }, this),\n            isCarouselOpen && selectedProject && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_ProjectCarousel__WEBPACK_IMPORTED_MODULE_3__.ProjectCarousel, {\n                images: selectedProject.images || [\n                    selectedProject.image\n                ],\n                projectType: selectedProject.type,\n                onClose: ()=>{\n                    setIsCarouselOpen(false);\n                    setSelectedProject(null);\n                }\n            }, void 0, false, {\n                fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n                lineNumber: 165,\n                columnNumber: 9\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/drewboynton/Documents/personal-portfolio/components/WorkSection.tsx\",\n        lineNumber: 85,\n        columnNumber: 5\n    }, this);\n}\n_s(WorkSection, \"jlO+euFcz+vAPG0OcHw5aZRwQh8=\");\n_c = WorkSection;\nvar _c;\n$RefreshReg$(_c, \"WorkSection\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2NvbXBvbmVudHMvV29ya1NlY3Rpb24udHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFFbUQ7QUFDckI7QUFDcUI7QUFDRztBQUNuQjtBQVluQyxNQUFNTSxlQUEwQjtJQUM5QjtRQUNFQyxJQUFJO1FBQ0pDLE9BQU87UUFDUEMsYUFBYTtRQUNiQyxNQUFNO1FBQ05DLE9BQU87UUFDUEMsUUFBUTtZQUFDO1NBQWtDO1FBQzNDQyxjQUFjO1lBQUM7WUFBUztZQUFXO1lBQWM7U0FBZTtJQUNsRTtJQUNBO1FBQ0VOLElBQUk7UUFDSkMsT0FBTztRQUNQQyxhQUFhO1FBQ2JDLE1BQU07UUFDTkMsT0FBTztRQUNQQyxRQUFRO1lBQ047WUFDQTtZQUNBO1lBQ0E7U0FDRDtRQUNEQyxjQUFjO1lBQUM7WUFBUztZQUFTO1NBQVc7SUFDOUM7Q0FDRDtBQUVNLFNBQVNDOztJQUNkLE1BQU1DLGVBQWVmLDZDQUFNQSxDQUE0QixFQUFFO0lBQ3pELE1BQU0sQ0FBQ2dCLGdCQUFnQkMsa0JBQWtCLEdBQUdmLCtDQUFRQSxDQUFDO0lBQ3JELE1BQU0sQ0FBQ2dCLGlCQUFpQkMsbUJBQW1CLEdBQUdqQiwrQ0FBUUEsQ0FBaUI7SUFFdkVELGdEQUFTQSxDQUFDO1FBQ1IsTUFBTW1CLFlBQVlkLGFBQWFlLEdBQUcsQ0FBQyxDQUFDQyxHQUFHQztZQUNyQyxPQUFPLElBQUlDLHFCQUNULENBQUNDO2dCQUNDQSxRQUFRQyxPQUFPLENBQUMsQ0FBQ0M7b0JBQ2YsSUFBSUEsTUFBTUMsY0FBYyxFQUFFO3dCQUN4QkQsTUFBTUUsTUFBTSxDQUFDQyxTQUFTLENBQUNDLEdBQUcsQ0FBQyxlQUFlO3dCQUMxQ0osTUFBTUUsTUFBTSxDQUFDQyxTQUFTLENBQUNFLE1BQU0sQ0FBQyxhQUFhO29CQUM3QztnQkFDRjtZQUNGLEdBQ0E7Z0JBQ0VDLFdBQVc7Z0JBQ1hDLFlBQVk7WUFDZDtRQUVKO1FBRUFuQixhQUFhb0IsT0FBTyxDQUFDVCxPQUFPLENBQUMsQ0FBQ1UsS0FBS2I7WUFDakMsSUFBSWEsS0FBS2hCLFNBQVMsQ0FBQ0csTUFBTSxDQUFDYyxPQUFPLENBQUNEO1FBQ3BDO1FBRUEsT0FBTztZQUNMckIsYUFBYW9CLE9BQU8sQ0FBQ1QsT0FBTyxDQUFDLENBQUNVLEtBQUtiO2dCQUNqQyxJQUFJYSxLQUFLaEIsU0FBUyxDQUFDRyxNQUFNLENBQUNlLFNBQVMsQ0FBQ0Y7WUFDdEM7UUFDRjtJQUNGLEdBQUcsRUFBRTtJQUVMLE1BQU1HLG1CQUFtQixDQUFDQztRQUN4QnJCLG1CQUFtQnFCO1FBQ25CdkIsa0JBQWtCO0lBQ3BCO0lBRUEscUJBQ0UsOERBQUN3QjtRQUFRbEMsSUFBRztRQUFPbUMsV0FBVTs7MEJBQzNCLDhEQUFDQztnQkFBSUQsV0FBVTs7a0NBQ2IsOERBQUNFO3dCQUFHRixXQUFVO2tDQUFzRDs7Ozs7O2tDQUVwRSw4REFBQ0M7d0JBQUlELFdBQVU7a0NBQ1pwQyxhQUFhZSxHQUFHLENBQUMsQ0FBQ21CLFNBQVNqQixzQkFDMUIsOERBQUNvQjtnQ0FFQ1AsS0FBS1MsQ0FBQUE7b0NBQ0g5QixhQUFhb0IsT0FBTyxDQUFDWixNQUFNLEdBQUdzQjtnQ0FDaEM7Z0NBQ0FILFdBQVU7MENBRVYsNEVBQUNDO29DQUFJRCxXQUFXLFFBSWYsT0FIQ0YsUUFBUTlCLElBQUksS0FBSyxZQUNiLGdCQUNBOztzREFFSiw4REFBQ2lDOzRDQUNDRCxXQUFXLFlBSVYsT0FIQ0YsUUFBUTlCLElBQUksS0FBSyxZQUNiLDZCQUNBO3NEQUdOLDRFQUFDaUM7Z0RBQ0NHLFNBQVMsSUFBTVAsaUJBQWlCQztnREFDaENFLFdBQVcsbUVBRVYsT0FEQ0YsUUFBUTlCLElBQUksS0FBSyxZQUFZLGtCQUFrQjswREFHaEQ4QixRQUFROUIsSUFBSSxLQUFLLHlCQUNoQiw4REFBQ2lDO29EQUFJRCxXQUFVOzhEQUNiLDRFQUFDckMsaUVBQWNBO3dEQUFDMEMsUUFBTzt3REFBV0MsT0FBTTt3REFBUUMsV0FBVztrRUFDekQsNEVBQUM5QyxrREFBS0E7NERBQ0orQyxLQUFLVixRQUFRN0IsS0FBSzs0REFDbEJ3QyxLQUFLWCxRQUFRaEMsS0FBSzs0REFDbEI0QyxJQUFJOzREQUNKVixXQUFVOzs7Ozs7Ozs7Ozs7Ozs7eUVBS2hCLDhEQUFDQztvREFBSUQsV0FBVTs4REFDYiw0RUFBQ3ZDLGtEQUFLQTt3REFDSitDLEtBQUtWLFFBQVE3QixLQUFLO3dEQUNsQndDLEtBQUtYLFFBQVFoQyxLQUFLO3dEQUNsQjRDLElBQUk7d0RBQ0pWLFdBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzREFPcEIsOERBQUNDOzRDQUFJRCxXQUFXLEdBQXFELE9BQWxERixRQUFROUIsSUFBSSxLQUFLLFdBQVcsbUJBQW1COzs4REFDaEUsOERBQUMyQztvREFBR1gsV0FBVTs4REFDWEYsUUFBUWhDLEtBQUs7Ozs7Ozs4REFFaEIsOERBQUM4QztvREFBRVosV0FBVTs4REFDVkYsUUFBUS9CLFdBQVc7Ozs7Ozs4REFFdEIsOERBQUNrQztvREFBSUQsV0FBVTs4REFDWkYsUUFBUTNCLFlBQVksQ0FBQ1EsR0FBRyxDQUFDLENBQUNrQyxxQkFDekIsOERBQUNDOzREQUVDZCxXQUFVO3NFQUVUYTsyREFISUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0JBMURWZixRQUFRakMsRUFBRTs7Ozs7Ozs7Ozs7Ozs7OztZQXdFdEJTLGtCQUFrQkUsaUNBQ2pCLDhEQUFDZCw2REFBZUE7Z0JBQ2RRLFFBQVFNLGdCQUFnQk4sTUFBTSxJQUFJO29CQUFDTSxnQkFBZ0JQLEtBQUs7aUJBQUM7Z0JBQ3pEOEMsYUFBYXZDLGdCQUFnQlIsSUFBSTtnQkFDakNnRCxTQUFTO29CQUNQekMsa0JBQWtCO29CQUNsQkUsbUJBQW1CO2dCQUNyQjs7Ozs7Ozs7Ozs7O0FBS1Y7R0FuSWdCTDtLQUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9jb21wb25lbnRzL1dvcmtTZWN0aW9uLnRzeD83NzNjIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgeyB1c2VSZWYsIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCBJbWFnZSBmcm9tICduZXh0L2ltYWdlJ1xuaW1wb3J0IHsgUHJvamVjdENhcm91c2VsIH0gZnJvbSAnLi9Qcm9qZWN0Q2Fyb3VzZWwnXG5pbXBvcnQgeyBEZXZpY2VGcmFtZXNldCB9IGZyb20gJ3JlYWN0LWRldmljZS1mcmFtZXNldCdcbmltcG9ydCAnQC9zdHlsZXMvZGV2aWNlLWZyYW1lcy5jc3MnXG5cbmludGVyZmFjZSBQcm9qZWN0IHtcbiAgaWQ6IHN0cmluZ1xuICB0aXRsZTogc3RyaW5nXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmdcbiAgdHlwZTogJ2Rlc2t0b3AnIHwgJ21vYmlsZSdcbiAgaW1hZ2U6IHN0cmluZ1xuICBpbWFnZXM/OiBzdHJpbmdbXVxuICB0ZWNobm9sb2dpZXM6IHN0cmluZ1tdXG59XG5cbmNvbnN0IG1vY2tQcm9qZWN0czogUHJvamVjdFtdID0gW1xuICB7XG4gICAgaWQ6ICdwcm9qZWN0MScsXG4gICAgdGl0bGU6ICdFLWNvbW1lcmNlIERhc2hib2FyZCcsXG4gICAgZGVzY3JpcHRpb246ICdBIGNvbXByZWhlbnNpdmUgZGFzaGJvYXJkIGZvciBtYW5hZ2luZyBvbmxpbmUgc3RvcmVzLCBmZWF0dXJpbmcgcmVhbC10aW1lIGFuYWx5dGljcywgaW52ZW50b3J5IG1hbmFnZW1lbnQsIGFuZCBjdXN0b21lciBpbnNpZ2h0cy4gQnVpbHQgd2l0aCBhIGZvY3VzIG9uIHVzYWJpbGl0eSBhbmQgcGVyZm9ybWFuY2UuJyxcbiAgICB0eXBlOiAnZGVza3RvcCcsXG4gICAgaW1hZ2U6ICcvaW1hZ2VzL3Byb2plY3RzL3Byb2plY3QxLTEucG5nJyxcbiAgICBpbWFnZXM6IFsnL2ltYWdlcy9wcm9qZWN0cy9wcm9qZWN0MS0xLnBuZyddLFxuICAgIHRlY2hub2xvZ2llczogWydSZWFjdCcsICdOZXh0LmpzJywgJ1R5cGVTY3JpcHQnLCAnVGFpbHdpbmQgQ1NTJ11cbiAgfSxcbiAge1xuICAgIGlkOiAnc2ltcGxlZml0bmVzcycsXG4gICAgdGl0bGU6ICdTaW1wbGUgRml0bmVzcyAoVHJhY2tpbmcgQXBwISknLFxuICAgIGRlc2NyaXB0aW9uOiAnQSBzaW1wbGUgZml0bmVzcyB0cmFja2luZyBhcHAgZm9yIGxvZ2dpbmcgc3RyZW5ndGggdHJhaW5pbmcgYW5kIGNhcmRpbyB3b3Jrb3V0cy4gQnVpbHQgbmF0aXZlbHkgb24gaU9TLCB3aGljaCBtYWtlcyB0aGlzIG15IGFjdHVhbCBnbyB0byBhcHAgZm9yIHRyYWNraW5nIG15IHdvcmtvdXRzLicsXG4gICAgdHlwZTogJ21vYmlsZScsXG4gICAgaW1hZ2U6ICcvaW1hZ2VzL3Byb2plY3RzL3NpbXBsZWZpdG5lc3MtMS5wbmcnLFxuICAgIGltYWdlczogW1xuICAgICAgJy9pbWFnZXMvcHJvamVjdHMvc2ltcGxlZml0bmVzcy0xLnBuZycsXG4gICAgICAnL2ltYWdlcy9wcm9qZWN0cy9zaW1wbGVmaXRuZXNzLTIucG5nJyxcbiAgICAgICcvaW1hZ2VzL3Byb2plY3RzL3NpbXBsZWZpdG5lc3MtMy5wbmcnLFxuICAgICAgJy9pbWFnZXMvcHJvamVjdHMvc2ltcGxlZml0bmVzcy00LnBuZydcbiAgICBdLFxuICAgIHRlY2hub2xvZ2llczogWydYY29kZScsICdTd2lmdCcsICdDb3JlRGF0YSddXG4gIH1cbl1cblxuZXhwb3J0IGZ1bmN0aW9uIFdvcmtTZWN0aW9uKCkge1xuICBjb25zdCBvYnNlcnZlclJlZnMgPSB1c2VSZWY8KEhUTUxEaXZFbGVtZW50IHwgbnVsbClbXT4oW10pXG4gIGNvbnN0IFtpc0Nhcm91c2VsT3Blbiwgc2V0SXNDYXJvdXNlbE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZWxlY3RlZFByb2plY3QsIHNldFNlbGVjdGVkUHJvamVjdF0gPSB1c2VTdGF0ZTxQcm9qZWN0IHwgbnVsbD4obnVsbClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9ic2VydmVycyA9IG1vY2tQcm9qZWN0cy5tYXAoKF8sIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKFxuICAgICAgICAoZW50cmllcykgPT4ge1xuICAgICAgICAgIGVudHJpZXMuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgICAgIGlmIChlbnRyeS5pc0ludGVyc2VjdGluZykge1xuICAgICAgICAgICAgICBlbnRyeS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnb3BhY2l0eS0xMDAnLCAndHJhbnNsYXRlLXktMCcpXG4gICAgICAgICAgICAgIGVudHJ5LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdvcGFjaXR5LTAnLCAndHJhbnNsYXRlLXktMTAnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aHJlc2hvbGQ6IDAuMSxcbiAgICAgICAgICByb290TWFyZ2luOiAnLTUwcHgnXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgb2JzZXJ2ZXJSZWZzLmN1cnJlbnQuZm9yRWFjaCgocmVmLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKHJlZikgb2JzZXJ2ZXJzW2luZGV4XS5vYnNlcnZlKHJlZilcbiAgICB9KVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIG9ic2VydmVyUmVmcy5jdXJyZW50LmZvckVhY2goKHJlZiwgaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKHJlZikgb2JzZXJ2ZXJzW2luZGV4XS51bm9ic2VydmUocmVmKVxuICAgICAgfSlcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZUltYWdlQ2xpY2sgPSAocHJvamVjdDogUHJvamVjdCkgPT4ge1xuICAgIHNldFNlbGVjdGVkUHJvamVjdChwcm9qZWN0KVxuICAgIHNldElzQ2Fyb3VzZWxPcGVuKHRydWUpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxzZWN0aW9uIGlkPVwid29ya1wiIGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1bI0Y1RjFFQV0gcHktMjRcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWF4LXctNnhsIG14LWF1dG8gcHgtNCBtZDpweC04XCI+XG4gICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LTN4bCBtZDp0ZXh0LTR4bCBmb250LWJvbGQgdGV4dC1bIzJDMkMyQ10gbWItMTJcIj5TZWxlY3RlZCBXb3JrPC9oMj5cbiAgICAgICAgXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0zMlwiPlxuICAgICAgICAgIHttb2NrUHJvamVjdHMubWFwKChwcm9qZWN0LCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBrZXk9e3Byb2plY3QuaWR9XG4gICAgICAgICAgICAgIHJlZj17ZWwgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyUmVmcy5jdXJyZW50W2luZGV4XSA9IGVsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm9wYWNpdHktMCB0cmFuc2xhdGUteS0xMCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0xMDAwIGVhc2Utb3V0XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BncmlkICR7XG4gICAgICAgICAgICAgICAgcHJvamVjdC50eXBlID09PSAnZGVza3RvcCcgXG4gICAgICAgICAgICAgICAgICA/ICdncmlkLWNvbHMtMScgXG4gICAgICAgICAgICAgICAgICA6ICdtZDpncmlkLWNvbHMtMiBnYXAtOCBpdGVtcy1jZW50ZXInXG4gICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2ByZWxhdGl2ZSAke1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LnR5cGUgPT09ICdkZXNrdG9wJ1xuICAgICAgICAgICAgICAgICAgICAgID8gJ2FzcGVjdC12aWRlbyB3LWZ1bGwgbWItOCdcbiAgICAgICAgICAgICAgICAgICAgICA6ICdoLVs2MDBweF0gbXgtYXV0byBtZDpteC0wIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyJ1xuICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPGRpdiBcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlSW1hZ2VDbGljayhwcm9qZWN0KX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgcmVsYXRpdmUgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbi10cmFuc2Zvcm0gaG92ZXI6c2NhbGUtWzEuMDJdICR7XG4gICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC50eXBlID09PSAnZGVza3RvcCcgPyAndy1mdWxsIGgtZnVsbCcgOiAnZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInXG4gICAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7cHJvamVjdC50eXBlID09PSAnbW9iaWxlJyA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRyYW5zZm9ybSBzY2FsZS1bMC44NV0gb3JpZ2luLWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPERldmljZUZyYW1lc2V0IGRldmljZT1cImlQaG9uZSBYXCIgY29sb3I9XCJibGFja1wiIGxhbmRzY2FwZT17ZmFsc2V9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8SW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9e3Byb2plY3QuaW1hZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtwcm9qZWN0LnRpdGxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJvYmplY3QtY292ZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9EZXZpY2VGcmFtZXNldD5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIHctZnVsbCBoLWZ1bGwgcm91bmRlZC1sZyBvdmVyZmxvdy1oaWRkZW4gc2hhZG93LWxnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8SW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtwcm9qZWN0LmltYWdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbHQ9e3Byb2plY3QudGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwib2JqZWN0LWNvdmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJvamVjdC50eXBlID09PSAnbW9iaWxlJyA/ICdtZDpvcmRlci1maXJzdCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1bIzJDMkMyQ10gbWItNFwiPlxuICAgICAgICAgICAgICAgICAgICB7cHJvamVjdC50aXRsZX1cbiAgICAgICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsjNEE0QTRBXSBtYi02XCI+XG4gICAgICAgICAgICAgICAgICAgIHtwcm9qZWN0LmRlc2NyaXB0aW9ufVxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtd3JhcCBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICB7cHJvamVjdC50ZWNobm9sb2dpZXMubWFwKCh0ZWNoKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17dGVjaH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTMgcHktMSBiZy1bI0U4RTJEN10gdGV4dC1bIzJDMkMyQ10gcm91bmRlZC1mdWxsIHRleHQtc21cIlxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0ZWNofVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAge2lzQ2Fyb3VzZWxPcGVuICYmIHNlbGVjdGVkUHJvamVjdCAmJiAoXG4gICAgICAgIDxQcm9qZWN0Q2Fyb3VzZWxcbiAgICAgICAgICBpbWFnZXM9e3NlbGVjdGVkUHJvamVjdC5pbWFnZXMgfHwgW3NlbGVjdGVkUHJvamVjdC5pbWFnZV19XG4gICAgICAgICAgcHJvamVjdFR5cGU9e3NlbGVjdGVkUHJvamVjdC50eXBlfVxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICAgIHNldElzQ2Fyb3VzZWxPcGVuKGZhbHNlKVxuICAgICAgICAgICAgc2V0U2VsZWN0ZWRQcm9qZWN0KG51bGwpXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgPC9zZWN0aW9uPlxuICApXG59XG5cbiJdLCJuYW1lcyI6WyJ1c2VSZWYiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsIkltYWdlIiwiUHJvamVjdENhcm91c2VsIiwiRGV2aWNlRnJhbWVzZXQiLCJtb2NrUHJvamVjdHMiLCJpZCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJ0eXBlIiwiaW1hZ2UiLCJpbWFnZXMiLCJ0ZWNobm9sb2dpZXMiLCJXb3JrU2VjdGlvbiIsIm9ic2VydmVyUmVmcyIsImlzQ2Fyb3VzZWxPcGVuIiwic2V0SXNDYXJvdXNlbE9wZW4iLCJzZWxlY3RlZFByb2plY3QiLCJzZXRTZWxlY3RlZFByb2plY3QiLCJvYnNlcnZlcnMiLCJtYXAiLCJfIiwiaW5kZXgiLCJJbnRlcnNlY3Rpb25PYnNlcnZlciIsImVudHJpZXMiLCJmb3JFYWNoIiwiZW50cnkiLCJpc0ludGVyc2VjdGluZyIsInRhcmdldCIsImNsYXNzTGlzdCIsImFkZCIsInJlbW92ZSIsInRocmVzaG9sZCIsInJvb3RNYXJnaW4iLCJjdXJyZW50IiwicmVmIiwib2JzZXJ2ZSIsInVub2JzZXJ2ZSIsImhhbmRsZUltYWdlQ2xpY2siLCJwcm9qZWN0Iiwic2VjdGlvbiIsImNsYXNzTmFtZSIsImRpdiIsImgyIiwiZWwiLCJvbkNsaWNrIiwiZGV2aWNlIiwiY29sb3IiLCJsYW5kc2NhcGUiLCJzcmMiLCJhbHQiLCJmaWxsIiwiaDMiLCJwIiwidGVjaCIsInNwYW4iLCJwcm9qZWN0VHlwZSIsIm9uQ2xvc2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./components/WorkSection.tsx\n"));

/***/ })

});