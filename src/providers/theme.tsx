import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {ThemeProvider as MThemeProvider, createTheme, CssBaseline} from '@mui/material';
import {getAppTheme} from 'local-storage';
import {themeAtom} from 'atoms';
import {DEFAULT_THEME} from 'const';

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        login: true;
    }
}

const themes = {
    'light': createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#086c81', // Dark Cyan
                light: '#cbdde1', // Light Steel Green
                dark: '#022229', // Very Dark Teal
            },
            background: {
                default: '#f5f8f9',
                paper: '#ffffff',
            },
            text: {
                primary: '#022229', // Very Dark Teal - dark enough for strong contrast
                secondary: '#054d5c', // Darker shade for secondary text for better readability
            }
        },
        components: {
            MuiIcon: {
                styleOverrides: {
                    root: {
                        color: '#086c81', // Dark Cyan for icons
                    },
                },
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: '#086c81', // Dark Cyan for SVG icons
                        fontSize: '1.25rem', // Slightly larger icons for better visibility
                    },
                },
            },
        },
    }),
    'dark': createTheme({
        palette: {
            mode: 'dark',
            divider: 'rgba(203, 221, 225, 0.12)', // Light Steel Green with opacity - increased for visibility
            primary: {
                main: '#0a8ca5', // Slightly brighter Dark Cyan for better visibility
                light: '#cbdde1', // Light Steel Green
                dark: '#022229', // Very Dark Teal
                contrastText: '#ffffff', // White text for primary buttons
            },
            error: {
                main: '#F23047'
            },
            background: {
                default: '#022229', // Very Dark Teal
                paper: '#043642', // Slightly lighter than Very Dark Teal
            },
            text: {
                primary: '#ffffff', // Pure white for primary text for maximum contrast
                secondary: '#cbdde1', // Light Steel Green for secondary - brighter than before
            }
        },
        typography: {
            allVariants: {
                fontFamily: 'Inter, sans-serif'
            },
            button: {
                textTransform: 'none',
                fontWeight: 500, // Slightly bolder for better visibility
            },
            fontSize: 16,
            h1: {
                fontWeight: 600,
                letterSpacing: '-0.025em',
            },
            h2: {
                fontWeight: 600,
                letterSpacing: '-0.025em',
            },
            h3: {
                fontWeight: 600,
            },
            h4: {
                fontWeight: 600,
            },
            h5: {
                fontWeight: 600,
            },
            h6: {
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: 4,
        },
        components: {
            MuiLink: {
                variants: [
                    {
                        props: {variant: 'inherit'},
                        style: {
                            color: '#0a8ca5', // Brighter Dark Cyan for better link visibility
                            textDecorationColor: '#0a8ca5',
                            fontWeight: 500, // Slightly bolder for better visibility
                        },
                    },
                ],
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        fontWeight: 500, // Slightly bolder text for buttons
                        boxShadow: 'none', // Remove default shadow
                    },
                },
                variants: [
                    {
                        props: {variant: 'login'},
                        style: {
                            background: 'rgba(8, 108, 129, 0.25)', // Dark Cyan with higher opacity
                            ':hover': {
                                background: 'rgba(8, 108, 129, 0.4)', // Even higher opacity on hover
                            }
                        },
                    },
                    {
                        props: {variant: 'contained'},
                        style: {
                            textShadow: '0 1px 1px rgba(0,0,0,0.3)', // Text shadow for contained buttons
                        },
                    },
                ],
            },
            MuiIcon: {
                styleOverrides: {
                    root: {
                        color: '#0a8ca5', // Brighter Dark Cyan for icons
                    },
                },
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: '#0a8ca5', // Brighter Dark Cyan for SVG icons
                        fontSize: '1.25rem', // Slightly larger icons for better visibility
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: '#a3c4c9', // Lighter label color for better visibility
                    },
                },
            },
        },
    })
}

const ThemeProvider = (props: { children: React.ReactNode }) => {
    const [appTheme, setAppTheme] = useAtom(themeAtom);

    useEffect(() => {
        getAppTheme().then(s => {
            setAppTheme(['dark', 'light'].includes(s) ? s : DEFAULT_THEME);
        });
    }, []);

    if (appTheme === undefined) return null;  // Wait until we find theme from storage

    return <MThemeProvider theme={themes[appTheme]}>{props.children}<CssBaseline/></MThemeProvider>;
}

export default ThemeProvider;
