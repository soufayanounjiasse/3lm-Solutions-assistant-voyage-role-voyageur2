import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@ApiTags('document')
@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('voyages/:voyageId/document')
  create(@Param('voyageId') voyageId: string, @Body() dto: CreateDocumentDto) {
    return this.documentService.create(voyageId, dto);
  }

  @Post('voyages/:voyageId/document/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', example: 'BILLET' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${suffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
    }),
  )
  uploadDocument(
    @Param('voyageId') voyageId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
  ) {
    return this.documentService.createFromUpload(voyageId, file, type);
  }

  @Get('voyages/:voyageId/document')
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