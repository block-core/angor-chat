import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useAtom} from 'jotai';
import uniq from 'lodash.uniq';
import {darken} from '@mui/material';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import {grey} from '@mui/material/colors';
import {useNavigate} from '@reach/router';
import {nip19} from 'nostr-tools';
import {Haptics, ImpactStyle} from '@capacitor/haptics';
import useContentRenderer from 'hooks/use-render-content';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import useStyles from 'hooks/use-styles';
import Avatar from 'views/components/avatar';
import ProfileDialog from 'views/components/dialogs/profile';
import MessageReactions from 'views/components/message-reactions';
import MessageMenuWeb from 'views/components/message-menu/web';
import MessageMobileMobile from 'views/components/message-menu/mobile';
import {activeMessageAtom, profilesAtom, threadRootAtom, spammersAtom} from 'atoms';
import {Message,} from 'types';
import {formatMessageTime, formatMessageFromNow, formatMessageDateTime} from 'helper';
import ChevronRight from 'svg/chevron-right';
import {PLATFORM} from 'const';
import {truncateMiddle} from 'util/truncate';


const MessageView = (props: { message: Message, compactView: boolean, dateFormat: 'time' | 'fromNow', inThreadView?: boolean }) => {
    const {message, compactView, dateFormat, inThreadView} = props;
    const theme = useTheme();
    const styles = useStyles();
    const navigate = useNavigate();
    const [profiles] = useAtom(profilesAtom);
    const profile = profiles.find(x => x.creator === message.creator);
    const [threadRoot, setThreadRoot] = useAtom(threadRootAtom);
    const [activeMessage] = useAtom(activeMessageAtom);
    const [spammers] = useAtom(spammersAtom);
    const [t] = useTranslation();
    const [, showModal] = useModal();
    const {isMd} = useMediaBreakPoint();
    const renderer = useContentRenderer();
    const holderEl = useRef<HTMLDivElement | null>(null);
    const [menu, setMenu] = useState<boolean>(false);
    const [mobileMenu, setMobileMenu] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const profileName = useMemo(() => truncateMiddle((profile?.name || nip19.npubEncode(message.creator)), (isMd ? 40 : 22), ':'), [profile, message]);
    const messageTime = useMemo(() => dateFormat === 'time' ? formatMessageTime(message.created) : formatMessageFromNow(message.created), [message]);
    const messageDateTime = useMemo(() => formatMessageDateTime(message.created), [message]);
    const lastReply = useMemo(() => message.children && message.children.length > 0 ? formatMessageFromNow(message.children[message.children.length - 1].created) : null, [message]);
    let mobileMenuTimer: any = null;
    const canTouch = styles.canTouch();
    const canHover = styles.canHover();
    const [showSpammer, setShowSpammer] = useState<boolean>(false);
    const isSpammer = spammers[message.creator] !== undefined;
    const renderedBody = useMemo(() => {
        const sx = {
            fontSize: '.8em',
            background: grey[800],
            display: 'inline-flex',
            borderRadius: '6px',
            p: '0 6px',
            cursor: 'pointer',
            ':hover': {
                background: grey[600],
            }
        }
        if (isSpammer && !showSpammer) {
            return <Box sx={sx} onClick={() => {
                setShowSpammer(true);
            }}>{t('This account appears to be a spammer. Click to show message.')}</Box>
        } else if (isSpammer && showSpammer) {
            return <>
                {renderer(message)}
                <Box sx={{...sx, mt: '10px'}} onClick={() => {
                    setShowSpammer(false);
                }}>{t('Hide')}</Box>
            </>
        } else {
            return renderer(message);
        }
    }, [message, isSpammer, showSpammer]);

    const profileClicked = () => {
        showModal({
            body: <ProfileDialog profile={profile} pubkey={message.creator} onDM={() => {
                navigate(`/dm/${nip19.npubEncode(message.creator)}`).then();
            }}/>,
            maxWidth: 'xs',
            hideOnBackdrop: true
        });
    };

    useEffect(() => {
        if (!holderEl.current) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        });
        observer.observe(holderEl.current);

        return () => {
            observer.disconnect();
        }
    }, [isVisible]);

    useEffect(() => {
        if (mobileMenu && PLATFORM !== 'web') {
            // Send a small vibration
            Haptics.impact({style: ImpactStyle.Light}).then();
        }
    }, [mobileMenu]);

    const ps = isMd ? '24px' : '10px';
    return <Box
        data-visible={isVisible}
        data-id={message.id}
        className="message"
        ref={holderEl}
        sx={{
            display: 'flex',
            p: `${!compactView ? '15px' : '3px'} ${ps} 0 ${ps}`,
            position: 'relative',
            background: activeMessage === message.id || mobileMenu ? theme.palette.divider : null,
            ...styles.withHover({
                ':hover': {
                    background: theme.palette.divider
                }
            }),
            userSelect: canTouch ? 'none' : null
        }}
        onMouseEnter={() => {
            if (canHover) setMenu(true);
        }}
        onMouseLeave={() => {
            if (canHover) setMenu(false);
        }}
        onTouchStart={() => {
            mobileMenuTimer = setTimeout(() => {
                setMobileMenu(true);
            }, 600);
        }}
        onTouchEnd={() => {
            clearTimeout(mobileMenuTimer);
        }}
        onTouchCancel={() => {
            clearTimeout(mobileMenuTimer);
        }}
        onTouchMove={() => {
            clearTimeout(mobileMenuTimer);
        }}
        onContextMenu={(e) => {
            if (canTouch) {
                // don't want to see context menu while using dev tools
                e.preventDefault();
            }
        }}
    >
        {(menu || activeMessage === message.id) && (<Box sx={{
            position: 'absolute',
            right: '10px',
            top: '-10px'
        }}><MessageMenuWeb message={message} inThreadView={inThreadView}/></Box>)}
        <Box sx={{
            display: 'flex',
            width: '40px',
            flexGrow: 0,
            flexShrink: 0,
        }}>
            {compactView ? null :
                <Box sx={{cursor: 'pointer'}} onClick={profileClicked}>
                    <Avatar src={profile?.picture} seed={message.creator} size={40}/>
                </Box>}
        </Box>
        <Box sx={{flexGrow: 1, ml: '12px'}}>
            {!compactView && (<Box sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.8em',
                lineHeight: '1em',
                mr: '12px',
                mb: '12px'
            }}>
                <Box onClick={profileClicked} sx={{
                    fontWeight: '600',
                    mr: '5px',
                    cursor: 'pointer'
                }}>{profileName}</Box>
                <Tooltip title={messageDateTime} placement="right">
                    <Box sx={{
                        color: darken(theme.palette.text.secondary, 0.3),
                        fontSize: '90%',
                        cursor: 'default'
                    }}>{messageTime}</Box>
                </Tooltip>
            </Box>)}
            <Box sx={{
                fontSize: '0.9em',
                mt: '4px',
                wordBreak: 'break-word',
                lineHeight: '1.4em',
                color: theme.palette.text.secondary
            }}>{renderedBody}</Box>
            {(!inThreadView && message.children && message.children.length > 0) && (
                <Box sx={{
                    p: '6px',
                    mb: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    border: '1px solid transparent',
                    color: darken(theme.palette.text.secondary, 0.3),
                    borderRadius: theme.shape.borderRadius,
                    'svg': {
                        display: 'none',
                    },
                    ':hover': {
                        borderColor: theme.palette.divider,
                        background: theme.palette.background.paper,
                        'svg': {
                            display: 'block',
                        },
                    }
                }} onClick={() => {
                    setThreadRoot(message);
                }}>
                    {uniq(message.children.map(m => m.creator)).slice(0, 4).map(c => {
                        const profile = profiles.find(x => x.creator === c);
                        return <Box key={c} sx={{
                            mr: '6px',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <Avatar src={profile?.picture} seed={c} size={20}/>
                        </Box>
                    })}
                    <Box sx={{mr: '10px', color: theme.palette.primary.main, fontWeight: 'bold'}}>
                        {message.children.length === 1 ? t('1 reply') : t('{{n}} replies', {n: message.children.length})}
                    </Box>
                    {(isMd && !threadRoot) && (
                        <>
                            <Box sx={{mr: '10px'}}>
                                {t('Last reply {{n}}', {n: lastReply!})}
                            </Box>
                            <ChevronRight height={20}/>
                        </>
                    )}
                </Box>
            )}
            <MessageReactions message={message}/>
            {mobileMenu && <MessageMobileMobile
                message={message}
                profileName={profileName}
                inThreadView={inThreadView}
                onClose={() => {
                    setMobileMenu(false);
                }}/>}
        </Box>
    </Box>;
}

export default MessageView;
