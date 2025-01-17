import pc from "picocolors"

export class Logger {

    public static LogMessage(message: string, object?: any): void {
        const now = new Date();
        const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} / ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        console.log(pc.blue(`[${formattedDateTime}]`) + ' ' + message + ' ' + pc.yellow(object ?? ""))
    }
    public static Error(message: string, object?: any): void {
        const now = new Date();
        const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} / ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        console.log(pc.red(`[${formattedDateTime}]`) + ' ' + message + ' ' + pc.yellow(object ?? "")) 
    }
}
