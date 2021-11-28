import { Props, Nullable, Required, DtoFactory } from './dto';

class TestDto {
    id: Required<number>;
    name: Nullable<string>;
}

describe('Dto', () => {
    it('should create instance from props', () => {
        const props: Props<TestDto> = {
            id: 1,
            name: 'test',
        };
        expect(DtoFactory.create<TestDto>(TestDto, props)).toMatchObject(props);
    });
});
