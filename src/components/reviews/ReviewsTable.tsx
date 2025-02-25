
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewAnalysis } from "@/services/reviewService";

interface ReviewsTableProps {
  reviews: ReviewAnalysis[];
}

export const ReviewsTable: React.FC<ReviewsTableProps> = ({ reviews }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Message Type</TableHead>
            <TableHead>Competitor URL</TableHead>
            <TableHead>Key Feedback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{review.business_name}</TableCell>
              <TableCell>{review.rating}</TableCell>
              <TableCell className="max-w-md">
                <div className="truncate">{review.review_text}</div>
              </TableCell>
              <TableCell>{review.topic}</TableCell>
              <TableCell>{review.category}</TableCell>
              <TableCell>{review.message_type}</TableCell>
              <TableCell>
                {review.competitor_url ? (
                  <a 
                    href={review.competitor_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate block max-w-xs"
                  >
                    {review.competitor_url}
                  </a>
                ) : '-'}
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate">{review.feedback_location}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
