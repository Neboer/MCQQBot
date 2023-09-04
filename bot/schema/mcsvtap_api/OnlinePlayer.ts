export default interface OnlinePlayer {
    balance: number;
    uuid: string;
    displayName: string;
    address: string;
    port: number;
    exhaustion: number;
    exp: number;
    whitelisted: boolean;
    banned: boolean;
    op: boolean;
    location: number[];
    dimension: "NORMAL" | "NETHER" | "THE_END" | "CUSTOM";
    health: number;
    hunger: number;
    saturation: number;
    gamemode: "CREATIVE" | "SURVIVAL" | "ADVENTURE" | "SPECTATOR";
    lastPlayed: number;
}
