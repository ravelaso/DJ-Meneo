import { Song, audioType} from "../utils";
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
    console.log(`Song pushed to Queue: ${song}`)
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
