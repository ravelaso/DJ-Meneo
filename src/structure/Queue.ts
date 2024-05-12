import { Song, audioType} from "../utils";
import { Logger } from "./Logger";
export default class Queue {
  private songs: Song[];
  constructor() {
    this.songs = [];
  }
  public addSong(url: string, type: audioType, name?:string, filename?:string, thumbnail?: string): void {
    const song: Song = {
      url: url,
      type: type,
      name: name,
      filename: filename,
      thumbnail: thumbnail
    };
    Logger.LogMessage("Song pushed to Queue:" , `{ \n${song.name ?? song.filename} \nUrl: ${song.url} \n}`)
    this.songs.push(song);
  }
  public nextSong(): Song | undefined {
    return this.songs[0];
  }
  public shiftSong(): Song | undefined {
    return this.songs.shift();
  }
  public isEmpty(): boolean {
    return this.songs.length === 0;
  }
  public clear(): void {
    this.songs = [];
  }
  
}
