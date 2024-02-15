function t(color, tt) {
    return color + tt + "\x1b[0m"
}
export function Reset(tt) {
    return "\x1b[0m" + tt
}
export function Bright(tt) {
    return t("\x1b[1m", tt)
}
export function Dim(tt) {
    return t("\x1b[2m", tt)
}
export function Underscore(tt) {
    return t("\x1b[4m", tt)
}
export function Blink(tt) {
    return t("\x1b[5m", tt)
}
export function Reverse(tt) {
    return t("\x1b[7m", tt)
}
export function Hidden(tt) {
    return t("\x1b[8m", tt)
}

export function Black(tt) {
    return t("\x1b[30m", tt)
}
export function Red(tt) {
    return t("\x1b[31m", tt)
}
export function Green(tt) {
    return t("\x1b[32m", tt)
}
export function Yellow(tt) {
    return t("\x1b[33m", tt)
}
export function Blue(tt) {
    return t("\x1b[34m", tt)
}
export function Magenta(tt) {
    return t("\x1b[35m", tt)
}
export function Cyan(tt) {
    return t("\x1b[36m", tt)
}
export function White(tt) {
    return t("\x1b[37m", tt)
}
