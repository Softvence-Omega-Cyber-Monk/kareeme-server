import { Injectable } from '@nestjs/common';
import { DistributionSubmissionService } from './distribution-submission.service';

@Injectable()
export class SubmissionService {
  constructor(private readonly submissionService: DistributionSubmissionService) {}

  async getSubmissions(distributorId: string, status: any, pg: any): Promise<any> {
    // Delegate to DistributionSubmissionService which already implements submission logic
    return this.submissionService.getSubmissions(status, pg);
  }

  async getSubmissionById(distributorId: string, releaseId: string): Promise<any> {
    return this.submissionService.getSubmissionById(releaseId);
  }

  async approveSubmission(distributorId: string, releaseId: string, dto: any): Promise<any> {
    return this.submissionService.approveSubmission(releaseId, dto?.note);
  }

  async declineSubmission(distributorId: string, releaseId: string, dto: any): Promise<any> {
    return this.submissionService.declineSubmission(releaseId, dto?.reason);
  }
}
