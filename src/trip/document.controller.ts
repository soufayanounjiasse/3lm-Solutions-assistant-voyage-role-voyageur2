import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@ApiTags('document')
@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('trip/:voyageId/document')
  create(@Param('voyageId') voyageId: string, @Body() dto: CreateDocumentDto) {
    return this.documentService.create(voyageId, dto);
  }

  @Get('trip/:voyageId/document')
  findAllByVoyage(@Param('voyageId') voyageId: string) {
    return this.documentService.findAllByVoyage(voyageId);
  }

  @Get('document/:id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch('document/:id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentService.update(id, dto);
  }

  @Delete('document/:id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}