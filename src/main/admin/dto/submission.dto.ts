import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmissionCardDto {
  @ApiProperty()
  releaseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  artist: string;

  @ApiProperty()
  type: string; // Single, Album, EP

  @ApiProperty()
  tracks: number;

  @ApiProperty()
  releaseDate: Date;

  @ApiProperty()
  submitDate: Date;

  @ApiProperty()
  status: string; // In Review, Approved, Declined

  @ApiPropertyOptional()
  artworkUrl?: string;
}

export class SubmissionDetailsDto {
  @ApiProperty()
  releaseId: string;

  @ApiProperty()
  status: string;

  // General Release Information
  @ApiProperty()
  labelName: string;

  @ApiProperty()
  catalogueNumber: string;

  @ApiProperty()
  releaseType: string;

  @ApiProperty()
  releaseDate: Date;

  @ApiProperty()
  distributor: string;

  @ApiProperty()
  releaseArtist: string;

  @ApiProperty()
  releaseTitle: string;

  @ApiProperty()
  releaseCLink: string;

  @ApiProperty()
  releasePLink: string;

  @ApiProperty()
  artworkLink: string;

  @ApiProperty()
  upc: string;

  // Track Details
  @ApiProperty({ type: [Object] })
  tracks: Array<{
    isrc: string;
    displayArtist: string;
    mixVersion: string;
    copyrightHolder: string;
    publisher: string;
    genre: string;
    language: string;
    explicit: string;
    originalReleaseDate: Date;
    tikTokStartTime: string;
    territory: string;
    audioFile: string;
  }>;

  // Artist Metadata
  @ApiProperty({ type: [Object] })
  artists: Array<{
    artistName: string;
    clientName: string;
    realName: string;
    artistType: string;
    songwriterRole: string;
    masterSplit: number;
    contractName: string;
    spotifyId: string;
    appleId: string;
  }>;
}
